// tslint:disable no-any no-array-mutation no-object-mutation readonly-keyword
import { Base, BaseModel, Field } from '@neotracker/server-db';
import _ from 'lodash';
import { Model } from 'objection';
import { Input, Mutation, RootCall, Type } from '../lib';
import { getGraphQLType } from '../utils';
import { getConnectionName, getEdgeName, getInterfaceName, getRootEdgeName, getTypeName } from './namer';

interface TypeDefs {
  [typeName: string]: string;
}
interface Relation {
  readonly name: string;
  readonly relatedModelClass: typeof Base;
}

interface GraphQLEdge {
  readonly name: string;
  readonly typeName: string;
  readonly typeDefs?: TypeDefs;
  readonly fieldName: string;
}

function isBaseModel(p: any): p is typeof BaseModel {
  return p.isModel;
}

export class TypeDefsBuilder {
  public readonly models: ReadonlyArray<typeof Base>;
  public readonly types: ReadonlyArray<typeof Type>;
  public readonly inputs: ReadonlyArray<typeof Input>;
  public readonly roots: ReadonlyArray<typeof RootCall>;
  public readonly mutations: ReadonlyArray<typeof Mutation>;

  public constructor(
    models: ReadonlyArray<typeof Base>,
    types: ReadonlyArray<typeof Type>,
    inputs: ReadonlyArray<typeof Input>,
    roots: ReadonlyArray<typeof RootCall>,
    mutations: ReadonlyArray<typeof Mutation>,
  ) {
    this.models = models;
    this.types = types;
    this.inputs = inputs;
    this.roots = roots;
    this.mutations = mutations;
  }

  public build(): ReadonlyArray<string> {
    let typeDefs = this.models
      .filter((model) => model.modelSchema.exposeGraphQLType)
      .reduce<any>(
        (typeDefsAcc, model) => ({
          ...typeDefsAcc,
          ...this.makeTypeDefs(model),
        }),
        {},
      );

    const queryFields = ['node(id: ID!): Node', 'nodes(ids: [ID!]!): [Node]!'];
    const rootCallFieldNames = new Set(this.roots.map((rootCall) => rootCall.fieldName));

    this.models
      .filter(isBaseModel)
      .filter((model) => !!model.modelSchema.exposeGraphQL)
      .forEach((model) => {
        const pluralEdge = this.makeEdgeType({
          edgeName: getRootEdgeName({ model, plural: true }),
          model,
          required: false,
          plural: true,
        });

        if (!rootCallFieldNames.has(pluralEdge.fieldName)) {
          if (pluralEdge.typeDefs) {
            typeDefs = { ...typeDefs, ...pluralEdge.typeDefs };
          }
          queryFields.push(this.constructField(pluralEdge.name, pluralEdge.typeName));
        }

        const idEdge = this.makeEdgeType({
          edgeName: getRootEdgeName({ model, plural: false }),
          model,
          required: false,
          plural: false,
          withID: true,
        });

        if (!rootCallFieldNames.has(idEdge.fieldName)) {
          if (idEdge.typeDefs) {
            typeDefs = { ...typeDefs, ...idEdge.typeDefs };
          }
          queryFields.push(this.constructField(idEdge.name, idEdge.typeName));
        }
      });
    const mutationTypeDefs = this.getMutationTypeDefs();
    const queryFieldsString = `
          ${queryFields.join('\n          ')}
          ${this.roots
            .map((rootCall) => `${rootCall.fieldName}${this.makeArguments(rootCall.args)}: ` + `${rootCall.typeName}`)
            .join('\n          ')}
    `;

    return [
      `
        schema {
          query: Query
          ${mutationTypeDefs.length === 0 ? '' : 'mutation: Mutation'}
        }
      `,
      `
        type Query {
          ${queryFieldsString}
        }
      `,
    ]
      .concat(Object.values(typeDefs))
      .concat(this.types.map((type) => type.typeDef))
      .concat(this.inputs.map((input) => input.typeDef))
      .concat(mutationTypeDefs);
  }

  public getMutationTypeDefs(): ReadonlyArray<string> {
    if (this.mutations.length === 0) {
      return [];
    }

    const typeDefs = [
      `
        type Mutation {
          ${this.mutations.map((mutation) => mutation.field).join('\n      ')}
        }
      `,
    ];

    this.mutations.forEach((mutation) => {
      typeDefs.push(mutation.type);
      typeDefs.push(mutation.inputType);
    });

    return typeDefs;
  }

  public makeTypeDefs(model: typeof Base): TypeDefs {
    const { fields, typeDefs } = this.makeAllFields(model);
    const interfaceString = this.getImplementsInterfaceString(model);

    const graphqlFields = this.makeFieldsString(fields);

    if (graphqlFields.length) {
      typeDefs[getTypeName(model)] = `
        type ${getTypeName(model)} ${interfaceString}{
          ${graphqlFields}
        }
      `;

      model.modelSchema.interfaces.forEach((iface) => {
        // tslint:disable-next-line strict-type-predicates
        if (typeDefs[getInterfaceName(iface)] === undefined) {
          const interfaceFields: any = {};
          iface.graphqlFields.forEach((field) => {
            let fieldname = field;
            let typename = fields[field];
            // tslint:disable-next-line strict-type-predicates
            if (typename === undefined) {
              const fieldWithArgs = `${field}(`;
              Object.entries(fields).forEach(([fieldName, typeName]) => {
                if (fieldName.startsWith(fieldWithArgs)) {
                  fieldname = fieldName;
                  typename = typeName;
                }
              });
            }
            if (field === 'id') {
              typename = 'ID!';
            }

            // tslint:disable-next-line strict-type-predicates
            if (typename === undefined) {
              throw new Error(`Could not find interface type for field ${field} on type ${model.modelSchema.name}`);
            }
            interfaceFields[fieldname] = typename;
          });
          const interfaceGraphqlFields = this.makeFieldsString(interfaceFields);
          if (interfaceGraphqlFields.length) {
            typeDefs[getInterfaceName(iface)] = `
              interface ${getInterfaceName(iface)} {
                ${interfaceGraphqlFields}
              }
            `;
          }
        }
      });
    }

    return typeDefs;
  }

  public makeFieldsString(fields: { readonly [field: string]: string }): string {
    return Object.entries(fields)
      .map(([fieldName, typeName]) => `${fieldName}: ${typeName}`)
      .join('\n          ');
  }

  public getImplementsInterfaceString(model: typeof Base): string {
    const interfaces = model.modelSchema.interfaces.map(getInterfaceName);
    let interfaceString = '';
    if (interfaces.length) {
      interfaceString = interfaces.length === 1 ? interfaces[0] : `${interfaces.join(', ')}`;
    }
    if (interfaceString.length) {
      interfaceString = `implements ${interfaceString}`;
    }

    return interfaceString;
  }

  public makeAllFields(
    model: typeof Base,
  ): {
    readonly fields: { [field: string]: string };
    readonly typeDefs: TypeDefs;
  } {
    const [fields, fieldsTypeDefs] = this.makeFields(model);
    const edges = this.makeEdges(model);

    const typeDefs = { ...fieldsTypeDefs };
    edges.forEach((edge) => {
      if (edge.typeDefs) {
        Object.entries(edge.typeDefs).forEach(([typeName, typeDef]) => {
          typeDefs[typeName] = typeDef;
        });
      }

      // tslint:disable-next-line strict-type-predicates
      if (fields[edge.name] !== undefined) {
        throw new Error(`Conflicting edge and/or field name ${edge.name}`);
      }
      fields[edge.name] = edge.typeName;
    });

    return { fields, typeDefs };
  }

  public makeEdgeType({
    sourceModel,
    edgeName,
    model,
    required,
    plural,
    withID = false,
  }: {
    readonly sourceModel?: typeof Base;
    readonly edgeName: string;
    readonly model: typeof Base;
    readonly required: boolean;
    readonly plural: boolean;
    readonly withID?: boolean;
  }): GraphQLEdge {
    if (plural) {
      const connectionTypeName = getConnectionName(sourceModel, edgeName);
      const edgeTypeName = getEdgeName(sourceModel, edgeName);
      const connectionTypeDef = `
        type ${connectionTypeName} {
          count: Int!
          edges: [${edgeTypeName}!]!
          pageInfo: PageInfo!
        }
      `;
      const edgeTypeDef = `
        type ${edgeTypeName} {
          cursor: String!
          node: ${getTypeName(model)}!
        }
      `;

      const args = {
        filters: '[FilterInput!]',
        orderBy: '[OrderByInput!]',
        first: 'Int',
        last: 'Int',
        before: 'String',
        after: 'String',
      };

      let pluralArgsString = Object.entries(args)
        .map(([argName, pluralTypeName]) => this.constructField(argName, pluralTypeName))
        .join(', ');
      if (pluralArgsString.length) {
        pluralArgsString = `(${pluralArgsString})`;
      }

      return {
        name: `${edgeName}${pluralArgsString}`,
        typeName: `${connectionTypeName}!`,
        typeDefs: {
          [connectionTypeName]: connectionTypeDef,
          [edgeTypeName]: edgeTypeDef,
        },

        fieldName: edgeName,
      };
    }

    let argsString = '';
    if (withID) {
      argsString = '(id: ID!)';
    }
    let typeName = getTypeName(model);
    if (required) {
      typeName = `${typeName}!`;
    }

    return {
      name: `${edgeName}${argsString}`,
      typeName,
      fieldName: edgeName,
    };
  }

  public makeFields(model: typeof Base): readonly [{ [fieldName: string]: string }, TypeDefs] {
    let typeDefs = {};
    const graphqlFields = Object.entries(model.modelSchema.fields)
      // tslint:disable-next-line no-unused
      .filter(([__, field]) => field.exposeGraphQL)
      .reduce<any>((fields, [fieldName, field]) => {
        const [fieldType, fieldTypeDefs] = this.getFieldType(field);
        typeDefs = { ...typeDefs, ...fieldTypeDefs };
        fields[fieldName] = fieldName === 'id' ? 'ID!' : fieldType;

        return fields;
      }, {});

    return [graphqlFields, typeDefs] as const;
  }

  public getFieldType(field: Field): readonly [string, TypeDefs] {
    if (field.type.type === 'custom') {
      return [field.type.graphqlType, field.type.typeDefs === undefined ? {} : field.type.typeDefs] as const;
    }
    let graphqlType = getGraphQLType(field.type);
    if ((field.type as any).plural) {
      graphqlType = `[${graphqlType}!]`;
    }
    if (field.required || field.type.type === 'id') {
      graphqlType = `${graphqlType}!`;
    }

    return [graphqlType, {}] as const;
  }

  public makeEdges(model: typeof Base): ReadonlyArray<GraphQLEdge> {
    const { edges } = model.modelSchema;
    if (edges === undefined) {
      return [];
    }

    const relations = (model as any).getRelations();

    return (
      // tslint:disable-next-line no-map-without-usage
      Object.entries(edges)
        // tslint:disable-next-line no-unused
        .filter(([__, edge]) => edge.exposeGraphQL)
        .map(([edgeName, edge]) => this.makeEdge(model, edgeName, edge.required || false, relations[edgeName]))
    );
  }

  public makeEdge(sourceModel: typeof Base, edgeName: string, required: boolean, relation: Relation): GraphQLEdge {
    const model = relation.relatedModelClass;
    // @ts-ignore
    if (relation instanceof Model.HasOneRelation || relation instanceof Model.BelongsToOneRelation) {
      return this.makeEdgeType({
        sourceModel,
        edgeName,
        model,
        required,
        plural: false,
      });
    }

    // @ts-ignore
    if (relation instanceof Model.HasManyRelation || relation instanceof Model.ManyToManyRelation) {
      return this.makeEdgeType({
        sourceModel,
        edgeName,
        model,
        required,
        plural: true,
      });
    }
    throw new Error(`Relation type ${relation.name} is not supported.`);
  }

  public constructField(fieldName: string, typeName: string): string {
    return `${fieldName}: ${typeName}`;
  }

  public makeArguments(args: { readonly [fieldName: string]: string }): string {
    if (_.isEmpty(args)) {
      return '';
    }

    return `(${Object.entries(args)
      .map(([fieldName, typeName]) => this.constructField(fieldName, typeName))
      .join(', ')})`;
  }
}
