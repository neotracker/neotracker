/* @flow */
import type { Base, Field } from 'neotracker-server-db';
import { Model } from 'objection';

import _ from 'lodash';
import { entries, values } from 'neotracker-shared-utils';

import { type Input, type Mutation, type RootCall, type Type } from '../lib';

import { getGraphQLType } from '../utils';
import {
  getConnectionName,
  getEdgeName,
  getInterfaceName,
  getRootEdgeName,
  getTypeName,
} from './namer';

type TypeDefs = { [typeName: string]: string };
type Relation = {|
  name: string,
  relatedModelClass: Class<Base>,
|};
type GraphQLEdge = {
  name: string,
  typeName: string,
  typeDefs?: TypeDefs,
  fieldName: string,
};

export default class TypeDefsBuilder {
  models: Array<Class<Base>>;
  types: Array<Class<Type>>;
  inputs: Array<Class<Input>>;
  roots: Array<Class<RootCall>>;
  mutations: Array<Class<Mutation>>;

  constructor(
    models: Array<Class<Base>>,
    types: Array<Class<Type>>,
    inputs: Array<Class<Input>>,
    roots: Array<Class<RootCall>>,
    mutations: Array<Class<Mutation>>,
  ) {
    this.models = models;
    this.types = types;
    this.inputs = inputs;
    this.roots = roots;
    this.mutations = mutations;
  }

  build(): Array<string> {
    let typeDefs = this.models
      .filter(model => model.modelSchema.exposeGraphQLType)
      .reduce(
        (typeDefsAcc, model) => ({
          ...typeDefsAcc,
          ...this.makeTypeDefs(model),
        }),
        {},
      );
    const queryFields = ['node(id: ID!): Node', 'nodes(ids: [ID!]!): [Node]!'];
    const rootCallFieldNames = new Set(
      this.roots.map(rootCall => rootCall.fieldName),
    );
    this.models
      .filter(model => !model.isEdge && !!model.modelSchema.exposeGraphQL)
      .forEach(model => {
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
          queryFields.push(
            this.constructField(pluralEdge.name, pluralEdge.typeName),
          );
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
            .map(
              rootCall =>
                `${rootCall.fieldName}${this.makeArguments(rootCall.args)}: ` +
                `${rootCall.typeName}`,
            )
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
      .concat(values(typeDefs))
      .concat(this.types.map(type => type.typeDef))
      .concat(this.inputs.map(input => input.typeDef))
      .concat(mutationTypeDefs);
  }

  getMutationTypeDefs(): Array<string> {
    if (this.mutations.length === 0) {
      return [];
    }

    const typeDefs = [
      `
        type Mutation {
          ${this.mutations.map(mutation => mutation.field).join('\n      ')}
        }
      `,
    ];

    this.mutations.forEach(mutation => {
      typeDefs.push(mutation.type);
      typeDefs.push(mutation.inputType);
    });

    return typeDefs;
  }

  makeTypeDefs(model: Class<Base>): TypeDefs {
    const { fields, typeDefs } = this.makeAllFields(model);
    const interfaceString = this.getImplementsInterfaceString(model);

    const graphqlFields = this.makeFieldsString(fields);

    if (graphqlFields.length) {
      typeDefs[getTypeName(model)] = `
        type ${getTypeName(model)} ${interfaceString}{
          ${graphqlFields}
        }
      `;

      model.modelSchema.interfaces.forEach(iface => {
        const interfaceFields = {};
        iface.graphqlFields.forEach(field => {
          let fieldname = field;
          let typename = fields[field];
          if (typename == null) {
            const fieldWithArgs = `${field}(`;
            entries(fields).forEach(([fieldName, typeName]) => {
              if (fieldName.startsWith(fieldWithArgs)) {
                fieldname = fieldName;
                typename = typeName;
              }
            });
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
      });
    }
    return typeDefs;
  }

  makeFieldsString(fields: { [field: string]: string }): string {
    return entries(fields)
      .map(([fieldName, typeName]) => `${fieldName}: ${typeName}`)
      .join('\n          ');
  }

  getImplementsInterfaceString(model: Class<Base>): string {
    const interfaces = model.modelSchema.interfaces.map(getInterfaceName);
    let interfaceString = '';
    if (interfaces.length) {
      if (interfaces.length === 1) {
        // eslint-disable-next-line
        interfaceString = interfaces[0];
      } else {
        interfaceString = `${interfaces.join(', ')}`;
      }
    }
    if (interfaceString.length) {
      interfaceString = `implements ${interfaceString}`;
    }

    return interfaceString;
  }

  makeAllFields(
    model: Class<Base>,
  ): {
    fields: { [field: string]: string },
    typeDefs: TypeDefs,
  } {
    const [fields, fieldsTypeDefs] = this.makeFields(model);
    const edges = this.makeEdges(model);

    const typeDefs = { ...fieldsTypeDefs };
    edges.forEach(edge => {
      if (edge.typeDefs) {
        entries(edge.typeDefs).forEach(([typeName, typeDef]) => {
          typeDefs[typeName] = typeDef;
        });
      }

      if (fields[edge.name] != null) {
        throw new Error(`Conflicting edge and/or field name ${edge.name}`);
      }
      fields[edge.name] = edge.typeName;
    });

    return { fields, typeDefs };
  }

  makeEdgeType({
    sourceModel,
    edgeName,
    model,
    required,
    plural,
    withID = false,
  }: {|
    sourceModel?: Class<Base>,
    edgeName: string,
    model: Class<Base>,
    required: boolean,
    plural: boolean,
    withID?: boolean,
  |}): GraphQLEdge {
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
      let argsString = entries(args)
        .map(([argName, typeName]) => this.constructField(argName, typeName))
        .join(', ');
      if (argsString.length) {
        argsString = `(${argsString})`;
      }

      return {
        name: `${edgeName}${argsString}`,
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

  makeFields(model: Class<Base>): [{ [fieldName: string]: string }, TypeDefs] {
    let typeDefs = {};
    const graphqlFields = entries(model.modelSchema.fields)
      // eslint-disable-next-line no-unused-vars
      .filter(([__, field]) => field.exposeGraphQL)
      .reduce((fields, [fieldName, field]) => {
        const [fieldType, fieldTypeDefs] = this.getFieldType(field);
        typeDefs = { ...typeDefs, ...fieldTypeDefs };
        // eslint-disable-next-line no-param-reassign
        fields[fieldName] = fieldType;
        return fields;
      }, {});
    return [graphqlFields, typeDefs];
  }

  getFieldType(field: Field): [string, TypeDefs] {
    if (field.type.type === 'custom') {
      return [field.type.graphqlType, field.type.typeDefs || {}];
    }
    let graphqlType = getGraphQLType(field.type);
    if (field.type.plural) {
      graphqlType = `[${graphqlType}!]`;
    }
    if (field.required || field.type.type === 'id') {
      graphqlType = `${graphqlType}!`;
    }

    return [graphqlType, {}];
  }

  makeEdges(model: Class<Base>): Array<GraphQLEdge> {
    const { edges } = model.modelSchema;
    if (edges == null) {
      return [];
    }

    const relations = model.getRelations();
    return (
      entries(edges)
        // eslint-disable-next-line no-unused-vars
        .filter(([__, edge]) => edge.exposeGraphQL)
        .map(([edgeName, edge]) =>
          this.makeEdge(
            model,
            edgeName,
            edge.required || false,
            relations[edgeName],
          ),
        )
    );
  }

  makeEdge(
    sourceModel: Class<Base>,
    edgeName: string,
    required: boolean,
    relation: Relation,
  ): GraphQLEdge {
    const model = relation.relatedModelClass;
    if (
      relation instanceof Model.HasOneRelation ||
      relation instanceof Model.BelongsToOneRelation
    ) {
      return this.makeEdgeType({
        sourceModel,
        edgeName,
        model,
        required,
        plural: false,
      });
    } else if (
      relation instanceof Model.HasManyRelation ||
      relation instanceof Model.ManyToManyRelation
    ) {
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

  constructField(fieldName: string, typeName: string): string {
    return `${fieldName}: ${typeName}`;
  }

  makeArguments(args: { [fieldName: string]: string }): string {
    if (_.isEmpty(args)) {
      return '';
    }

    return `(${entries(args)
      .map(([fieldName, typeName]) => this.constructField(fieldName, typeName))
      .join(', ')})`;
  }
}
