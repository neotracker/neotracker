/* @flow */
import type Knex from 'knex';
import { Model } from 'objection';
import type { Monitor } from '@neo-one/monitor';

import _ from 'lodash';
import { entries } from 'neotracker-shared-utils';

import type Base from './Base';
import type { GraphQLFieldResolver } from '../types';
import type IFace from './IFace';

import { makeAllPowerfulQueryContext } from './QueryContext';

export type UpdateOptions = {
  patch: boolean,
  old: ?Object,
};

export type StringFormat =
  | 'date'
  | 'time'
  | 'date-time'
  | 'uri'
  | 'email'
  | 'hostname'
  | 'ipv4'
  | 'ipv6'
  | 'regex'
  | 'uuid'
  | 'json-pointer'
  | 'relative-json-pointer';
type PrimitiveFieldType =
  | {| type: 'id', big: boolean |}
  | {| type: 'foreignID', modelType: string | Array<string> |}
  | {|
      type: 'string',
      minLength?: number,
      maxLength?: number,
      enum?: Array<string>,
      format?: StringFormat,
      default?: string,
    |}
  | {| type: 'integer', minimum?: number, maximum?: number, default?: number |}
  | {|
      type: 'bigInteger',
      minimum?: number,
      maximum?: number,
      default?: string,
    |}
  | {| type: 'decimal', minimum?: number, maximum?: number, default?: string |}
  | {| type: 'number', minimum?: number, maximum?: number, default?: number |}
  | {| type: 'boolean', default?: boolean |}
  | {| type: 'model', modelType: string, plural?: boolean |}
  | {| type: 'json' |};
export type FieldType =
  | PrimitiveFieldType
  | {|
      type: 'custom',
      typeDefs?: { [typename: string]: string },
      graphqlType: string,
    |}
  | {| type: 'array', items: PrimitiveFieldType |}
  | {| type: 'tsvector' |};

export type Field = {|
  type: FieldType,
  required?: boolean,
  exposeGraphQL?: boolean,
  computed?: boolean,
  graphqlResolver?: GraphQLFieldResolver<any, any>,
  // Automatically set, e.g. in beforeInsert/beforeUpdate
  auto?: boolean,
  unique?: boolean,
  index?: boolean,
|};
export type FieldSchema = {
  [fieldName: string]: Field,
};
type DirectJoinRelation = {
  from: string,
  to: string,
};
type ThroughJoinRelation = {
  from: string,
  through: {
    modelClass: Class<Base>,
    from: string,
    to: string,
  },
  to: string,
};
export type JoinRelation = DirectJoinRelation | ThroughJoinRelation;

export type Relation = {
  relation:
    | typeof Model.ManyToManyRelation
    | typeof Model.HasManyRelation
    | typeof Model.HasOneRelation
    | typeof Model.BelongsToOneRelation,
  modelClass: Class<Base>,
  join: JoinRelation,
  filter?: (builder: any) => any,
};
export type Edge = {|
  relation: Relation,
  exposeGraphQL?: boolean,
  required?: boolean,
  computed?: boolean,
  makeGraphQLResolver?: (
    resolver: GraphQLFieldResolver<any, any>,
  ) => GraphQLFieldResolver<any, any>,
|};
export type EdgeSchema = {
  [edgeName: string]: Edge,
};
export type ColIndexSchema = {|
  name: string,
  order: string,
|};
export type IndexSchema =
  | {|
      type: 'simple',
      columnNames: Array<string>,
      name: string,
      unique?: boolean,
    |}
  | {|
      type: 'order',
      columns: Array<ColIndexSchema>,
      name: string,
      unique?: boolean,
    |};
export type IDSchema = 'id' | ['id1', 'id2'];
export type ModelSchema = {|
  tableName: string,
  name: string,
  pluralName: string,
  id: IDSchema,
  fields: FieldSchema,
  edges?: EdgeSchema,
  exposeGraphQL?: boolean,
  exposeGraphQLType?: boolean,
  interfaces: Array<Class<IFace>>,
  isEdge: boolean,
  indices: Array<IndexSchema>,
  chainCustomBefore: (schema: any) => any,
  chainCustomAfter: (schema: any) => any,
  materializedView?: string,
|};

const makeJSONField = (field: Field) => {
  const fieldType = field.type;
  let type;
  switch (fieldType.type) {
    case 'id':
    case 'foreignID':
      type = field.required
        ? ['string', 'integer']
        : ['string', 'integer', 'null'];
      return { ...fieldType, type };
    case 'string':
      type = field.required ? 'string' : ['string', 'null'];
      if (fieldType.enum) {
        const copiedFieldType = { ...fieldType, type };
        delete copiedFieldType.enum;

        const enumType = field.required
          ? fieldType.enum
          : fieldType.enum.concat(null);
        return {
          allOf: [copiedFieldType, { enum: enumType }],
        };
      }
      return { ...fieldType, type };
    case 'bigInteger':
      type = field.required ? 'string' : ['string', 'null'];
      return { ...fieldType, type };
    case 'integer':
      type = field.required ? 'integer' : ['integer', 'null'];
      return { ...fieldType, type };
    case 'decimal':
      type = field.required ? 'string' : ['string', 'null'];
      return { ...fieldType, type };
    case 'number':
      type = field.required ? 'number' : ['number', 'null'];
      return { ...fieldType, type };
    case 'boolean':
      return fieldType;
    case 'array':
      return fieldType;
    case 'json':
      return { type: 'string' };
    case 'tsvector':
      return null;
    default:
      throw new Error(`Unknown field type: ${JSON.stringify(fieldType)}`);
  }
};
export const makeJSONSchema = (fieldSchema: FieldSchema) => {
  const required = entries(fieldSchema)
    .filter(
      // eslint-disable-next-line no-unused-vars
      ([__, field]) =>
        field.required &&
        !field.computed &&
        !field.auto &&
        // $FlowFixMe
        field.type.default == null,
    )
    // eslint-disable-next-line no-unused-vars
    .map(([fieldName, __]) => fieldName);

  const properties = {};
  entries(fieldSchema).forEach(([fieldName, field]) => {
    if (!field.computed) {
      const jsonField = makeJSONField(field);
      if (jsonField != null) {
        properties[fieldName] = jsonField;
      }
    }
  });

  return {
    type: 'object',
    required: required.length ? required : undefined,
    properties,
  };
};

export const makeRelationMappings = (edgeSchema: ?EdgeSchema) => {
  if (edgeSchema == null) {
    return {};
  }

  const relationMapping = {};
  entries(edgeSchema).forEach(([edgeName, edge]) => {
    relationMapping[edgeName] = edge.relation;
  });
  return relationMapping;
};

const getColumnType = (fieldType: FieldType) => {
  switch (fieldType.type) {
    case 'id':
    case 'foreignID':
    case 'integer':
      return 'integer';
    case 'bigInteger':
      return 'bigInteger';
    case 'decimal':
      return 'numeric';
    case 'string':
      return `varchar(${
        fieldType.maxLength == null ? 255 : fieldType.maxLength
      })`;
    case 'number':
      return 'float8';
    case 'boolean':
      return 'boolean';
    default:
      throw new Error(`Unknown field type: ${fieldType.type}`);
  }
};

const isBigIntID = (
  modelSchemas: { [modelName: string]: ModelSchema },
  modelType: string,
): boolean =>
  modelSchemas[modelType].fields.id != null &&
  modelSchemas[modelType].fields.id.type.type === 'id' &&
  modelSchemas[modelType].fields.id.type.big;

const isAnyBigIntID = (
  modelSchemas: { [modelName: string]: ModelSchema },
  modelType: string | Array<string>,
) => {
  if (typeof modelType === 'string') {
    return isBigIntID(modelSchemas, modelType);
  }
  return _.some(modelType.map(modelTpe => isBigIntID(modelSchemas, modelTpe)));
};

const addColumn = (
  db: Knex<*>,
  table: Object,
  fieldName: string,
  field: Field,
  modelSchemas: { [modelName: string]: ModelSchema },
) => {
  let col;
  const fieldType = field.type;
  if (fieldName === 'created_at') {
    col = table
      .integer(fieldName)
      .unsigned()
      .defaultTo(db.raw('extract(epoch FROM now())'));
  } else if (fieldName === 'updated_at') {
    col = table
      .integer(fieldName)
      .unsigned()
      .defaultTo(db.raw('extract(epoch FROM now())'));
  } else {
    switch (fieldType.type) {
      case 'id':
        if (fieldType.big) {
          col = table.bigIncrements(fieldName);
        } else {
          col = table.increments(fieldName);
        }
        col
          .primary()
          .unique()
          .notNullable()
          .unsigned();
        break;
      case 'foreignID':
        if (isAnyBigIntID(modelSchemas, fieldType.modelType)) {
          col = table.bigInteger(fieldName);
        } else {
          col = table.integer(fieldName);
        }
        col.unsigned();
        break;
      case 'integer':
        col = table.integer(fieldName);
        if (fieldType.minimum != null && fieldType.minimum >= 0) {
          col.unsigned();
        }
        break;
      case 'bigInteger':
        col = table.bigInteger(fieldName);
        if (fieldType.minimum != null && fieldType.minimum >= 0) {
          col.unsigned();
        }
        break;
      case 'decimal':
        col = table.specificType(fieldName, 'numeric');
        break;
      case 'string':
        col = table.text(fieldName);
        // col = table.string(fieldName, fieldType.maxLength || 255);
        break;
      case 'number':
        col = table.float(fieldName);
        break;
      case 'boolean':
        col = table.boolean(fieldName);
        break;
      case 'array':
        col = table.specificType(
          fieldName,
          `${getColumnType(fieldType.items)}[]`,
        );
        break;
      case 'json':
        col = table.jsonb(fieldName);
        break;
      case 'model':
        throw new Error(
          `Models/Interfaces cannot be columns in the Model. See ${fieldName}`,
        );
      case 'tsvector':
        col = table
          .specificType(fieldName, 'tsvector')
          .notNullable()
          .index(undefined, 'GIN');
        break;
      default:
        throw new Error(`Unknown field type for ${fieldName}`);
    }
  }

  if (field.required || fieldType.type === 'id') {
    col.notNullable();
  } else {
    col.nullable();
  }

  if (field.unique) {
    col.unique();
  } else if (field.index) {
    col.index();
  }

  if (fieldType.default !== undefined) {
    col.defaultTo(fieldType.default);
  }
};

export const setupForCreate = async (db: Knex<*>, monitor: Monitor) =>
  db
    .raw(
      `
  CREATE OR REPLACE FUNCTION update_updated_at() RETURNS TRIGGER AS $update_updated_at$
  BEGIN
    NEW.updated_at = extract(epoch FROM now());
    RETURN NEW;
  END;
  $update_updated_at$ language 'plpgsql';
`,
    )
    .queryContext(makeAllPowerfulQueryContext(monitor));

const getCreateIndex = (index: IndexSchema, tableName: string) => {
  if (index.type === 'order') {
    const cols = index.columns
      .map(col => `${col.name} ${col.order}`)
      .join(', ');
    let unique = '';
    if (index.unique) {
      unique = 'UNIQUE ';
    }

    return `
      CREATE ${unique}INDEX ${index.name} ON ${tableName} (${cols});
    `;
  }

  const cols = index.columnNames.map(col => `${col}`).join(', ');
  let unique = '';
  if (index.unique) {
    unique = 'UNIQUE ';
  }

  return `
    CREATE ${unique}INDEX ${index.name} ON ${tableName} (${cols});
  `;
};

export const createTable = async (
  db: Knex<*>,
  monitor: Monitor,
  modelSchema: ModelSchema,
  modelSchemas: { [modelType: string]: ModelSchema },
  bare?: boolean,
) => {
  const schema = ((db: any).schema: any);
  let executeSchema;
  if (modelSchema.materializedView != null) {
    executeSchema = currentSchema =>
      currentSchema.raw(modelSchema.materializedView);
  } else {
    executeSchema = currentSchema => {
      currentSchema.createTable(modelSchema.tableName, table => {
        entries(modelSchema.fields).forEach(([fieldName, field]) => {
          if (!field.computed) {
            addColumn(db, table, fieldName, field, modelSchemas);
          }
        });
        if (!bare) {
          if (_.isEqual(modelSchema.id, ['id1', 'id2'])) {
            table.primary(['id1', 'id2']);
          }
          modelSchema.indices.forEach(index => {
            if (index.type === 'simple') {
              if (index.unique) {
                table.unique(index.columnNames, index.name);
              } else {
                table.index(index.columnNames, index.name);
              }
            }
          });
        }
      });

      if (!bare) {
        modelSchema.indices.forEach(index => {
          if (index.type === 'order') {
            currentSchema.raw(getCreateIndex(index, modelSchema.tableName));
          }
        });
      }

      return currentSchema;
    };
  }
  let addUpdatedAtTrigger = currentSchema => currentSchema;
  if (modelSchema.fields.updated_at != null) {
    addUpdatedAtTrigger = currentSchema =>
      currentSchema
        .raw(
          `
      CREATE TRIGGER update_${modelSchema.tableName}_updated_at BEFORE UPDATE
      ON "${modelSchema.tableName}" FOR EACH ROW
      EXECUTE PROCEDURE update_updated_at()
    `,
        )
        .queryContext(makeAllPowerfulQueryContext(monitor));
  }
  const exists = await schema
    .hasTable(modelSchema.tableName)
    .queryContext(makeAllPowerfulQueryContext(monitor));
  if (!exists) {
    if (bare) {
      await addUpdatedAtTrigger(executeSchema(schema));
    } else {
      await addUpdatedAtTrigger(
        modelSchema.chainCustomAfter(
          executeSchema(modelSchema.chainCustomBefore(schema)),
        ),
      );
    }
  }
};

export const dropTable = async (
  db: Knex<*>,
  monitor: Monitor,
  modelSchema: ModelSchema,
) => {
  const schema = ((db: any).schema: any);
  if (modelSchema.materializedView == null) {
    await schema
      .dropTableIfExists(modelSchema.tableName)
      .queryContext(makeAllPowerfulQueryContext(monitor));
  } else {
    await schema
      .raw(
        `
      DROP MATERIALIZED VIEW IF EXISTS ${modelSchema.tableName} CASCADE;
    `,
      )
      .queryContext(makeAllPowerfulQueryContext(monitor));
  }
};

const EMPTY_DROP_INDICES = 'query string argument of EXECUTE is null';

export const dropIndices = async (
  db: Knex<*>,
  monitor: Monitor,
  tableName: string,
) => {
  try {
    await db
      .raw(
        `
      DO
      $$BEGIN
         EXECUTE (
         SELECT string_agg('ALTER TABLE ${tableName} DROP CONSTRAINT ' || conname, '; ')
         FROM   pg_constraint
         WHERE conrelid::regclass::text = '${tableName}'
         );
      END$$;
    `,
      )
      .queryContext(makeAllPowerfulQueryContext(monitor));
  } catch (error) {
    if (!error.message.includes(EMPTY_DROP_INDICES)) {
      throw error;
    }
  }
  try {
    await db
      .raw(
        `
      DO
      $$BEGIN
         EXECUTE (
         SELECT 'DROP INDEX ' || string_agg(indexname, ', ')
         FROM   pg_indexes
         WHERE tablename = '${tableName}'
         );
      END$$;
    `,
      )
      .queryContext(makeAllPowerfulQueryContext(monitor));
  } catch (error) {
    if (!error.message.includes(EMPTY_DROP_INDICES)) {
      throw error;
    }
  }
};

export const createIndices = async (
  db: Knex<*>,
  monitor: Monitor,
  modelSchema: ModelSchema,
) => {
  await Promise.all(
    modelSchema.indices.map(index =>
      db
        .raw(getCreateIndex(index, modelSchema.tableName))
        .queryContext(makeAllPowerfulQueryContext(monitor)),
    ),
  );
};

export const refreshTriggers = async (
  db: Knex<*>,
  monitor: Monitor,
  modelSchema: ModelSchema,
) => {
  await modelSchema
    .chainCustomAfter(
      modelSchema.chainCustomBefore(((db: $FlowFixMe).schema: $FlowFixMe)),
    )
    .queryContext(makeAllPowerfulQueryContext(monitor));
};
