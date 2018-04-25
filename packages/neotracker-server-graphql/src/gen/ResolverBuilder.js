/* @flow */
import { type Base, BaseModel } from 'neotracker-server-db';
import { CodedError } from 'neotracker-server-utils';
import {
  type Connection,
  fromGlobalID,
  toGlobalID,
} from 'neotracker-shared-graphql';
import { entries, labels, values } from 'neotracker-shared-utils';
import type { GraphQLFieldResolver, GraphQLResolveInfo } from 'graphql';
import { Model, QueryBuilder } from 'objection';

import _ from 'lodash';
import { camelCase } from 'change-case';
import { concat, of as _of } from 'rxjs';
import { metrics } from '@neo-one/monitor';

import { type GraphQLContext } from '../GraphQLContext';
import { type GraphQLResolver } from '../constants';
import type { Input, Mutation, RootCall, Type } from '../lib';

import {
  applyPagingArguments,
  buildEager,
  filterForFilterOrderBy,
  getFilterOrderByRelationExpression,
  getPagingArguments,
  parseFieldsFromInfo,
} from '../utils';
import { getInterfaceName, getRootEdgeName, getTypeName } from './namer';
import { liveExecuteField } from '../live';

const GRAPHQL_EXECUTE_FIELD_DURATION_SECONDS = metrics.createHistogram({
  name: 'graphql_execute_field_duration_seconds',
  labelNames: [labels.GRAPHQL_PATH],
});
const GRAPHQL_EXECUTE_FIELD_FAILURES_TOTAL = metrics.createCounter({
  name: 'graphql_execute_field_failures_total',
  labelNames: [labels.GRAPHQL_PATH],
});

function wrapFieldResolver(
  type: string,
  field: string,
  resolver: GraphQLFieldResolver<*, GraphQLContext>,
): GraphQLFieldResolver<*, GraphQLContext> {
  return async (...args) => {
    const context = (((args.length === 3
      ? args[1]
      : args[2]): $FlowFixMe): GraphQLContext);
    const info = (((args.length === 3
      ? args[2]
      : args[3]): $FlowFixMe): GraphQLResolveInfo);
    const span = context.getMonitor(info);
    return span
      .withLabels({
        [labels.GRAPHQL_PATH]: info.path.key,
      })
      .captureSpanLog(
        currentSpan => {
          context.spans[String(info.path.key)] = currentSpan;
          return resolver(...args);
        },
        {
          name: 'graphql_execute_field',
          level: { log: 'debug', span: 'info' },
          metric: {
            total: GRAPHQL_EXECUTE_FIELD_DURATION_SECONDS,
            error: GRAPHQL_EXECUTE_FIELD_FAILURES_TOTAL,
          },
          error: {},
          trace: true,
        },
      );
  };
}

function wrapResolver(
  type: string,
  field: string,
  resolverIn: GraphQLFieldResolver<*, GraphQLContext> | GraphQLResolver<*>,
): GraphQLFieldResolver<*, GraphQLContext> | GraphQLResolver<*> {
  const resolver = resolverIn;
  if (typeof resolver === 'function') {
    return wrapFieldResolver(type, field, resolver);
  }

  return {
    resolve: wrapFieldResolver(type, field, resolverIn.resolve),
    live: resolver.live,
  };
}

const resolveNode = (
  obj: Object,
  { id }: { id: string },
  context: GraphQLContext,
  info: GraphQLResolveInfo,
) => {
  const { type: typeName, id: modelID } = fromGlobalID(id);
  const modelLoaderName = camelCase(typeName);
  const loader = context.rootLoader.loaders[modelLoaderName];
  if (loader != null) {
    return loader.load({ id: modelID, monitor: context.getMonitor(info) });
  }

  throw new CodedError(CodedError.NOT_FOUND_ERROR);
};

const makeResolveModelLive = (
  model: Class<BaseModel<number>> | Class<BaseModel<string>>,
) =>
  liveExecuteField(
    (
      obj: Object,
      args: Object,
      context: GraphQLContext,
      info: GraphQLResolveInfo,
    ) => concat(_of(null), model.observable(obj, args, context, info)),
  );

function isBaseModel(p) {
  return p.isModel;
}

export default class ResolverBuilder {
  models: Array<Class<Base>>;
  types: Array<Class<Type>>;
  inputs: Array<Class<Input>>;
  roots: Array<Class<RootCall>>;
  mutations: Array<Class<Mutation>>;
  doProfiling: boolean;

  constructor(
    models: Array<Class<Base>>,
    types: Array<Class<Type>>,
    inputs: Array<Class<Input>>,
    roots: Array<Class<RootCall>>,
    mutations: Array<Class<Mutation>>,
    doProfiling: boolean,
  ) {
    this.models = models;
    this.types = types;
    this.inputs = inputs;
    this.roots = roots;
    this.mutations = mutations;
    this.doProfiling = doProfiling;
  }

  build(): Object {
    const resolvers = {
      Query: {},
      ...this.getMutationResolvers(),
    };
    let typeResolvers = {};
    this.models
      .map(model => (isBaseModel(model) ? model : null))
      .filter(Boolean)
      .forEach(model => {
        if (model.modelSchema.exposeGraphQL) {
          resolvers.Query[
            getRootEdgeName({ model, plural: true })
          ] = this.makeResolveNodes(model);
          resolvers.Query[
            getRootEdgeName({ model, plural: false })
          ] = this.makeResolveNode(model);
        }

        const edgeResolvers = this.getEdgeResolvers(model);
        const fieldResolvers = this.getFieldResolvers(model);
        const typeName = getTypeName(model);
        typeResolvers[typeName] = {
          ...edgeResolvers,
          ...fieldResolvers,
        };

        model.modelSchema.interfaces.forEach(iface => {
          typeResolvers[getInterfaceName(iface)] = {
            __resolveType(obj: Base): string {
              return getTypeName(obj.constructor);
            },
          };
        });
      });

    typeResolvers = _.mapValues(typeResolvers, (fieldResolvers, typeName) => ({
      id: (obj: Base) => toGlobalID(typeName, obj.id),
      ...fieldResolvers,
    }));

    resolvers.Query = {
      ...resolvers.Query,
      ...this.roots.reduce(
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

    const wrappedResolvers = {};
    for (const [type, fieldResolvers] of entries(allResolvers)) {
      wrappedResolvers[type] = {};
      for (const [field, fieldResolver] of entries(fieldResolvers)) {
        wrappedResolvers[type][field] = wrapResolver(
          type,
          field,
          fieldResolver,
        );
      }
    }

    return wrappedResolvers;
  }

  makeResolveNode(
    model: Class<BaseModel<number>> | Class<BaseModel<string>>,
  ): GraphQLResolver<*> {
    return {
      resolve: resolveNode,
      live: makeResolveModelLive(model),
    };
  }

  makeResolveNodes(
    model: Class<BaseModel<number>> | Class<BaseModel<string>>,
  ): GraphQLResolver<*> {
    return {
      resolve: this.makeResolver({ model }),
      live: makeResolveModelLive(model),
    };
  }

  getMutationResolvers(): Object {
    if (this.mutations.length === 0) {
      return {};
    }

    const resolvers = {
      Mutation: {},
    };

    this.mutations.forEach(mutation => {
      resolvers.Mutation = {
        ...resolvers.Mutation,
        [mutation.mutationName]: async (
          obj: Object,
          args: any,
          context: GraphQLContext,
          info: GraphQLResolveInfo,
        ): Promise<any> => mutation.resolver(obj, args.input, context, info),
      };
    });

    return resolvers;
  }

  getEdgeResolvers(model: Class<Base>): Object {
    const edgeResolvers = {};
    const relations = model.getRelations();
    const edges = model.modelSchema.edges || {};
    entries(edges).forEach(([edgeName, edge]) => {
      const relation = relations[edgeName];
      if (relation && edge.exposeGraphQL) {
        if (
          relation instanceof Model.BelongsToOneRelation ||
          relation instanceof Model.HasOneRelation
        ) {
          edgeResolvers[edgeName] = this.makeSingleEdgeResolver({
            edge: {
              name: edgeName,
              model: relation.relatedModelClass,
              makeGraphQLResolver: edge.makeGraphQLResolver,
            },
          });
        } else if (
          relation instanceof Model.ManyToManyRelation ||
          relation instanceof Model.HasManyRelation
        ) {
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

  getFieldResolvers(model: Class<Base>): Object {
    return entries(model.modelSchema.fields).reduce(
      (acc, [fieldName, field]) => {
        if (field.graphqlResolver != null) {
          acc[fieldName] = field.graphqlResolver;
        }
        return acc;
      },
      {},
    );
  }

  makeResolver({
    model,
    edge,
  }: {
    model: Class<Base>,
    edge?: {
      name: string,
      model: Class<Base>,
    },
  }): GraphQLFieldResolver<*, GraphQLContext> {
    return async (
      obj: Object,
      argsIn: Object,
      context: GraphQLContext,
      info: GraphQLResolveInfo,
    ) => {
      if (obj != null && edge != null && obj.$relatedQuery == null) {
        return obj[edge.name];
      }

      const thisModel = edge == null ? model : edge.model;
      const builder =
        edge == null
          ? model.query(context.rootLoader.db)
          : obj.$relatedQuery(edge.name, context.rootLoader.db);
      builder.context(
        context.rootLoader.makeQueryContext(context.getMonitor(info)),
      );
      const args = argsIn;

      const edgesBuilder = builder.clone();
      const countBuilder = builder.clone();
      filterForFilterOrderBy({
        query: countBuilder,
        model: thisModel,
        filters: args.filters,
      });

      const fields = values(parseFieldsFromInfo(info))[0];
      const [edgesResult, countResult] = await Promise.all([
        this.getEdges(
          obj,
          thisModel,
          context,
          edgesBuilder,
          args,
          fields,
          info,
          edge,
        ),
        this.getCount(thisModel, countBuilder, fields),
      ]);

      return { ...edgesResult, ...countResult };
    };
  }

  makeSingleEdgeResolver({
    edge,
  }: {
    edge: {
      name: string,
      model: Class<BaseModel<number>> | Class<BaseModel<string>>,
      makeGraphQLResolver?: (
        resolveEdge: GraphQLFieldResolver<*, GraphQLContext>,
      ) => GraphQLFieldResolver<*, GraphQLContext>,
    },
  }): GraphQLFieldResolver<*, GraphQLContext> {
    const resolveEdge = async (
      obj: Object,
      args: Object,
      context: GraphQLContext,
      info: GraphQLResolveInfo,
    ) => {
      if (obj.constructor == null || obj[edge.name] != null) {
        return obj[edge.name];
      }

      const edgeSchema = obj.constructor.modelSchema.edges[edge.name];
      const { relation } = edgeSchema;
      const monitor = context.getMonitor(info);
      if (
        relation.relation === Model.HasOneRelation ||
        relation.relation === Model.BelongsToOneRelation
      ) {
        // eslint-disable-next-line
        const [__0, fromFieldName] = relation.join.from.split('.');
        const field = obj[fromFieldName];
        if (field == null) {
          return null;
        }

        return obj
          .getLoaderByEdge(
            context.rootLoader.makeQueryContext(monitor),
            edge.name,
          )
          .load({ id: field, monitor });
      }

      const builder = obj
        .$relatedQuery(edge.name, context.rootLoader.db)
        .context(context.rootLoader.makeQueryContext(monitor));
      const fields = values(parseFieldsFromInfo(info))[0];
      const eager = buildEager(fields, edge.model);
      if (eager) {
        builder.eager(eager);
      }

      return builder;
    };

    return edge.makeGraphQLResolver == null
      ? resolveEdge
      : edge.makeGraphQLResolver(resolveEdge);
  }

  async getEdges(
    obj: Object,
    model: Class<Base>,
    context: GraphQLContext,
    builder: QueryBuilder,
    args: Object,
    fields: Object,
    info: GraphQLResolveInfo,
    edge?: {
      name: string,
      model: Class<Base>,
    },
  ): Promise<Connection<any>> {
    if (fields.edges == null) {
      return {};
    }

    const monitor = context.getMonitor(info);

    if (edge != null && _.isEmpty(args)) {
      const edgeSchema = obj.constructor.modelSchema.edges[edge.name];
      const { relation } = edgeSchema;
      if (relation.relation === Model.HasManyRelation) {
        // eslint-disable-next-line
        const [__0, fromFieldName] = relation.join.from.split('.');
        const field = obj[fromFieldName];
        if (field == null) {
          return {};
        }
        const results = await obj
          .getLoaderByEdge(
            context.rootLoader.makeQueryContext(context.getMonitor(info)),
            edge.name,
          )
          .load({ id: field, monitor });

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

    const res = await applyPagingArguments({
      builder,
      paging: getPagingArguments(args),
    });

    return res;
  }

  async getCount(
    model: Class<Base>,
    builder: QueryBuilder,
    fields: Object,
  ): Promise<Object> {
    if (fields.count == null) {
      return {};
    }

    return builder.count('*').first();
  }
}
