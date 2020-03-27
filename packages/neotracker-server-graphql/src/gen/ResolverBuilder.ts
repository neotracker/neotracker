// tslint:disable no-any no-object-mutation no-loop-statement
import { AggregationType, globalStats, MeasureUnit } from '@neo-one/client-switch';
import { labelsToTags } from '@neo-one/utils';
import { createChild, serverLogger } from '@neotracker/logger';
import { Base, BaseModel } from '@neotracker/server-db';
import { CodedError } from '@neotracker/server-utils';
import { Connection, fromGlobalID, toGlobalID } from '@neotracker/shared-graphql';
import { labels } from '@neotracker/shared-utils';
import { camelCase } from 'change-case';
import DataLoader from 'dataloader';
import { GraphQLFieldResolver, GraphQLResolveInfo } from 'graphql';
import _ from 'lodash';
import { Model, QueryBuilder } from 'objection';
import { concat, of as _of } from 'rxjs';
import { GraphQLResolver } from '../constants';
import { GraphQLContext } from '../GraphQLContext';
import { Input, Mutation, RootCall, Type } from '../lib';
import { liveExecuteField } from '../live';
import {
  applyPagingArguments,
  buildEager,
  filterForFilterOrderBy,
  getFilterOrderByRelationExpression,
  getPagingArguments,
  parseFieldsFromInfo,
} from '../utils';
import { getInterfaceName, getRootEdgeName, getTypeName } from './namer';

const requestSec = globalStats.createMeasureInt64('requests/duration', MeasureUnit.SEC);
const requestErrors = globalStats.createMeasureInt64('requests/failures', MeasureUnit.UNIT);

const GRAPHQL_EXECUTE_FIELD_DURATION_SECONDS = globalStats.createView(
  'graphql_execute_field_duration_seconds',
  requestSec,
  AggregationType.DISTRIBUTION,
  labelsToTags([labels.GRAPHQL_PATH]),
  'distribution of graphql request durations',
  [1, 2, 5, 7.5, 10, 12.5, 15, 17.5, 20],
);
globalStats.registerView(GRAPHQL_EXECUTE_FIELD_DURATION_SECONDS);

const GRAPHQL_EXECUTE_FIELD_FAILURES_TOTAL = globalStats.createView(
  'graphql_execute_field_failures_total',
  requestErrors,
  AggregationType.COUNT,
  labelsToTags([labels.GRAPHQL_PATH]),
  'total graphql execute field failures',
);
globalStats.registerView(GRAPHQL_EXECUTE_FIELD_FAILURES_TOTAL);

const serverGQLLogger = createChild(serverLogger, { component: 'graphql' });

function wrapFieldResolver(
  _type: string,
  _field: string,
  resolver: GraphQLFieldResolver<any, GraphQLContext>,
): GraphQLFieldResolver<any, GraphQLContext> {
  return async (...args: any[]) => {
    const startTime = Date.now();
    const info = (args.length === 3 ? args[2] : args[3]) as GraphQLResolveInfo;
    const logInfo = {
      title: 'graphql_execute_field',
      [labels.GRAPHQL_PATH]: info.path.key,
    };
    try {
      serverGQLLogger.info({ ...logInfo });
      globalStats.record([
        {
          measure: requestSec,
          value: Date.now() - startTime,
        },
      ]);

      // @ts-ignore
      return resolver(...args);
    } catch (error) {
      serverGQLLogger.error({ ...logInfo });
      globalStats.record([
        {
          measure: requestErrors,
          value: 1,
        },
      ]);
      throw error;
    }
  };
}

function wrapResolver(
  type: string,
  field: string,
  resolverIn: GraphQLFieldResolver<any, GraphQLContext> | GraphQLResolver<any>,
): GraphQLFieldResolver<any, GraphQLContext> | GraphQLResolver<any> {
  const resolver = resolverIn;
  if (typeof resolver === 'function') {
    return wrapFieldResolver(type, field, resolver);
  }

  return {
    resolve: wrapFieldResolver(type, field, (resolverIn as GraphQLResolver<any>).resolve),
    live: resolver.live,
  };
}

const resolveNode = async (
  _obj: any,
  { id }: { readonly id: string },
  context: GraphQLContext,
  _info: GraphQLResolveInfo,
) => {
  const { type: typeName, id: modelID } = fromGlobalID(id);
  const modelLoaderName = camelCase(typeName);
  const loader = context.rootLoader.loaders[modelLoaderName] as DataLoader<any, any> | undefined;
  if (loader !== undefined) {
    return loader.load({ id: modelID });
  }

  throw new CodedError(CodedError.NOT_FOUND_ERROR);
};

const makeResolveModelLive = (model: typeof BaseModel) =>
  liveExecuteField((obj, args, context, info) => concat(_of(undefined), model.observable$(obj, args, context, info)));

function isBaseModel(p: any): p is typeof BaseModel {
  return p.isModel;
}

export class ResolverBuilder {
  public readonly models: ReadonlyArray<typeof Base>;
  public readonly types: ReadonlyArray<typeof Type>;
  public readonly inputs: ReadonlyArray<typeof Input>;
  public readonly roots: ReadonlyArray<typeof RootCall>;
  public readonly mutations: ReadonlyArray<typeof Mutation>;
  public readonly doProfiling: boolean;

  public constructor(
    models: ReadonlyArray<typeof Base>,
    types: ReadonlyArray<typeof Type>,
    inputs: ReadonlyArray<typeof Input>,
    roots: ReadonlyArray<typeof RootCall>,
    mutations: ReadonlyArray<typeof Mutation>,
    doProfiling: boolean,
  ) {
    this.models = models;
    this.types = types;
    this.inputs = inputs;
    this.roots = roots;
    this.mutations = mutations;
    this.doProfiling = doProfiling;
  }

  public build(): any {
    const resolvers = {
      Query: {},
      ...this.getMutationResolvers(),
    };

    let typeResolvers: any = {};
    this.models.filter(isBaseModel).forEach((model) => {
      if (model.modelSchema.exposeGraphQL) {
        resolvers.Query[getRootEdgeName({ model, plural: true })] = this.makeResolveNodes(model);
        resolvers.Query[getRootEdgeName({ model, plural: false })] = this.makeResolveNode(model);
      }

      const edgeResolvers = this.getEdgeResolvers(model);
      const fieldResolvers = this.getFieldResolvers(model);
      const typeName = getTypeName(model);
      typeResolvers[typeName] = {
        ...edgeResolvers,
        ...fieldResolvers,
      };

      model.modelSchema.interfaces.forEach((iface) => {
        typeResolvers[getInterfaceName(iface)] = {
          __resolveType(obj: Base): string {
            return getTypeName(obj.constructor as any);
          },
        };
      });
    });

    typeResolvers = _.mapValues(typeResolvers, (fieldResolvers, typeName) => ({
      id: (obj: any) => toGlobalID(typeName, obj.id),
      ...fieldResolvers,
    }));

    resolvers.Query = {
      ...resolvers.Query,
      ...this.roots.reduce<any>(
        (accum, rootCall) => ({
          ...accum,
          [rootCall.fieldName]: rootCall.makeResolver(),
        }),
        {},
      ),
    };

    const allResolvers = {
      ...resolvers,
      ...typeResolvers,
    };

    const wrappedResolvers: any = {};
    for (const [type, fieldResolvers] of Object.entries(allResolvers)) {
      wrappedResolvers[type] = {};
      for (const [field, fieldResolver] of Object.entries(fieldResolvers as object)) {
        wrappedResolvers[type][field] = wrapResolver(type, field, fieldResolver);
      }
    }

    return wrappedResolvers;
  }

  public makeResolveNode(model: typeof BaseModel): GraphQLResolver<any> {
    return {
      resolve: resolveNode,
      live: makeResolveModelLive(model),
    } as any;
  }

  public makeResolveNodes(model: typeof BaseModel): GraphQLResolver<any> {
    return {
      resolve: this.makeResolver({ model }),
      live: makeResolveModelLive(model),
    };
  }

  public getMutationResolvers(): any {
    if (this.mutations.length === 0) {
      return {};
    }

    const resolvers = {
      Mutation: {},
    };

    this.mutations.forEach((mutation) => {
      resolvers.Mutation = {
        ...resolvers.Mutation,
        [mutation.mutationName]: async (
          obj: any,
          args: any,
          context: GraphQLContext,
          info: GraphQLResolveInfo,
        ): Promise<any> => mutation.resolver(obj, args.input, context, info),
      };
    });

    return resolvers;
  }

  public getEdgeResolvers(model: typeof Base): any {
    const edgeResolvers: any = {};
    const relations = (model as any).getRelations();
    const edges = model.modelSchema.edges === undefined ? {} : model.modelSchema.edges;
    Object.entries(edges).forEach(([edgeName, edge]) => {
      const relation = relations[edgeName];
      if (relation && edge.exposeGraphQL) {
        // @ts-ignore
        if (relation instanceof Model.BelongsToOneRelation || relation instanceof Model.HasOneRelation) {
          edgeResolvers[edgeName] = this.makeSingleEdgeResolver({
            edge: {
              name: edgeName,
              model: relation.relatedModelClass,
              makeGraphQLResolver: edge.makeGraphQLResolver,
            },
          });
          // @ts-ignore
        } else if (relation instanceof Model.ManyToManyRelation || relation instanceof Model.HasManyRelation) {
          edgeResolvers[edgeName] = this.makeResolver({
            model,
            edge: {
              name: edgeName,
              model: relation.relatedModelClass,
            },
          });
        } else {
          throw new Error(`Relation type ${relation.name} is not supported.`);
        }
      }
    });

    return edgeResolvers;
  }

  public getFieldResolvers(model: typeof Base): any {
    return Object.entries(model.modelSchema.fields).reduce<any>((acc, [fieldName, field]) => {
      if (field.graphqlResolver !== undefined) {
        acc[fieldName] = field.graphqlResolver;
      }

      return acc;
    }, {});
  }

  public makeResolver({
    model,
    edge,
  }: {
    readonly model: typeof Base;
    readonly edge?: {
      readonly name: string;
      readonly model: typeof Base;
    };
  }): GraphQLFieldResolver<any, GraphQLContext> {
    return async (obj, argsIn, context, info) => {
      if (obj != undefined && edge !== undefined && obj.$relatedQuery == undefined) {
        return obj[edge.name];
      }

      const thisModel = edge === undefined ? model : edge.model;
      const builder =
        edge === undefined ? model.query(context.rootLoader.db) : obj.$relatedQuery(edge.name, context.rootLoader.db);
      builder.context(context.rootLoader.makeQueryContext());

      const args = argsIn;

      const edgesBuilder = builder.clone();
      const countBuilder = builder.clone();
      filterForFilterOrderBy({
        query: countBuilder,
        model: thisModel,
        filters: args.filters,
      });

      const fields = Object.values(parseFieldsFromInfo(info))[0];
      const [edgesResult, countResult] = await Promise.all([
        this.getEdges(obj, thisModel, context, edgesBuilder, args, fields, info, edge),

        this.getCount(thisModel, countBuilder, fields),
      ]);

      return { ...edgesResult, ...countResult };
    };
  }

  public makeSingleEdgeResolver({
    edge,
  }: {
    readonly edge: {
      readonly name: string;
      readonly model: typeof BaseModel;
      readonly makeGraphQLResolver?: (
        resolveEdge: GraphQLFieldResolver<any, GraphQLContext>,
      ) => GraphQLFieldResolver<any, GraphQLContext>;
    };
  }): GraphQLFieldResolver<any, GraphQLContext> {
    const resolveEdge = async (obj: any, _args: any, context: GraphQLContext, info: GraphQLResolveInfo) => {
      if (obj.constructor == undefined || obj[edge.name] != undefined) {
        return obj[edge.name];
      }

      const edgeSchema = obj.constructor.modelSchema.edges[edge.name];
      const { relation } = edgeSchema;
      if (relation.relation === Model.HasOneRelation || relation.relation === Model.BelongsToOneRelation) {
        const fromFieldName = relation.join.from.split('.')[1];
        const field = obj[fromFieldName];
        if (field == undefined) {
          return undefined;
        }
        // Clear the cache for that address when we check coin balances so we get latest balance from DB
        if (edge.name === 'coins') {
          obj.getLoaderByEdge(context.rootLoader.makeQueryContext(), edge.name).clear({ id: field });
        }

        const result = await obj.getLoaderByEdge(context.rootLoader.makeQueryContext(), edge.name).load({ id: field });

        if (edge.name === 'coins') {
          obj.getLoaderByEdge(context.rootLoader.makeQueryContext(), edge.name).clear({ id: field });
        }

        return result;
      }

      const builder = obj
        .$relatedQuery(edge.name, context.rootLoader.db)
        .context(context.rootLoader.makeQueryContext());
      const fields = Object.values(parseFieldsFromInfo(info))[0];
      const eager = buildEager(fields, edge.model);
      if (eager) {
        builder.eager(eager);
      }

      return builder;
    };

    return edge.makeGraphQLResolver === undefined ? resolveEdge : edge.makeGraphQLResolver(resolveEdge);
  }

  public async getEdges(
    obj: any,
    model: typeof Base,
    context: GraphQLContext,
    builder: QueryBuilder<any>,
    args: any,
    fields: any,
    _info: GraphQLResolveInfo,
    edge?: {
      readonly name: string;
      readonly model: typeof Base;
    },
  ): Promise<Connection<any>> {
    if (fields.edges == undefined) {
      return {};
    }

    if (edge !== undefined && _.isEmpty(args)) {
      const edgeSchema = obj.constructor.modelSchema.edges[edge.name];
      const { relation } = edgeSchema;
      if (relation.relation === Model.HasManyRelation) {
        const fromFieldName = relation.join.from.split('.')[1];
        const field = obj[fromFieldName];
        if (field == undefined) {
          return {};
        }

        // Clear the cache for that address when we check coin balances so we get latest balance from DB
        if (edge.name === 'coins') {
          obj.getLoaderByEdge(context.rootLoader.makeQueryContext(), edge.name).clear({ id: field });
        }
        const results: any[] = await obj
          .getLoaderByEdge(context.rootLoader.makeQueryContext(), edge.name)
          .load({ id: field });

        if (edge.name === 'coins') {
          obj.getLoaderByEdge(context.rootLoader.makeQueryContext(), edge.name).clear({ id: field });
        }

        return {
          edges: results.map((result, idx) => ({
            cursor: `${idx}`,
            node: result,
          })),

          pageInfo: {
            hasPreviousPage: false,
            hasNextPage: false,
          },
        };
      }
    }

    filterForFilterOrderBy({
      query: builder,
      model,
      filters: args.filters,
      orderBy: args.orderBy,
    });

    const relationExpression = getFilterOrderByRelationExpression({
      model,
      filters: args.filters,
      orderBy: args.orderBy,
    });

    if (relationExpression) {
      builder.joinRelation(relationExpression);
    }

    return applyPagingArguments({
      builder,
      paging: getPagingArguments(args),
    });
  }

  public async getCount(_model: typeof Base, builder: QueryBuilder<any>, fields: any): Promise<any> {
    if (fields.count == undefined) {
      return {};
    }

    return builder.count('*').first();
  }
}
