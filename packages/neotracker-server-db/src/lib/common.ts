import { GraphQLFieldResolver } from 'graphql';
import Knex from 'knex';
import _ from 'lodash';
import { JsonSchema, RelationMapping, RelationMappings } from 'objection';
import { isPostgres, isSqlite } from '../knexUtils';
import { IFace } from './IFace';
import { makeAllPowerfulQueryContext } from './QueryContext';

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
  | { readonly type: 'id'; readonly big: boolean }
  | { readonly type: 'foreignID'; readonly modelType: string | ReadonlyArray<string> }
  | {
      readonly type: 'string';
      readonly minLength?: number;
      readonly maxLength?: number;
      readonly enum?: ReadonlyArray<string>;
      readonly format?: StringFormat;
      readonly default?: string;
    }
  | { readonly type: 'integer'; readonly minimum?: number; readonly maximum?: number; readonly default?: number }
  | {
      readonly type: 'bigInteger';
      readonly minimum?: number;
      readonly maximum?: number;
      readonly default?: string;
    }
  | { readonly type: 'decimal'; readonly minimum?: number; readonly maximum?: number; readonly default?: string }
  | { readonly type: 'number'; readonly minimum?: number; readonly maximum?: number; readonly default?: number }
  | { readonly type: 'boolean'; readonly default?: boolean }
  | { readonly type: 'model'; readonly modelType: string; readonly plural?: boolean }
  | { readonly type: 'json' };
export type FieldType =
  | PrimitiveFieldType
  | {
      readonly type: 'custom';
      readonly typeDefs?: { readonly [typename: string]: string };
      readonly graphqlType: string;
    }
  | { readonly type: 'array'; readonly items: PrimitiveFieldType }
  | { readonly type: 'tsvector' };
export interface Field {
  readonly type: FieldType;
  readonly required?: boolean;
  readonly exposeGraphQL?: boolean;
  readonly computed?: boolean;
  // tslint:disable-next-line no-any
  readonly graphqlResolver?: GraphQLFieldResolver<any, any>;
  readonly auto?: boolean;
  readonly unique?: boolean;
  readonly index?: boolean;
}
export interface FieldSchema {
  readonly [fieldName: string]: Field;
}
export interface Edge {
  readonly relation: RelationMapping;
  readonly exposeGraphQL?: boolean;
  readonly required?: boolean;
  readonly computed?: boolean;
  // tslint:disable-next-line no-any
  readonly makeGraphQLResolver?: (resolver: GraphQLFieldResolver<any, any>) => GraphQLFieldResolver<any, any>;
}
export interface EdgeSchema {
  readonly [edgeName: string]: Edge;
}
export interface ColIndexSchema {
  readonly name: string;
  readonly order: string;
}
export type IndexSchema =
  | {
      readonly type: 'simple';
      readonly columnNames: ReadonlyArray<string>;
      readonly name: string;
      readonly unique?: boolean;
    }
  | {
      readonly type: 'order';
      readonly columns: ReadonlyArray<ColIndexSchema>;
      readonly name: string;
      readonly unique?: boolean;
    };
// tslint:disable-next-line: readonly-array
export type IDSchema = 'id' | ['id1', 'id2'];
export interface ModelSchema {
  readonly tableName: string;
  readonly name: string;
  readonly pluralName: string;
  readonly id: IDSchema;
  readonly fields: FieldSchema;
  readonly edges?: EdgeSchema;
  readonly exposeGraphQL?: boolean;
  readonly exposeGraphQLType?: boolean;
  readonly interfaces: ReadonlyArray<IFace>;
  readonly isEdge: boolean;
  readonly indices: ReadonlyArray<IndexSchema>;
  readonly chainCustomBefore: (schema: Knex.SchemaBuilder) => Knex.SchemaBuilder;
  readonly chainCustomAfter: (schema: Knex.SchemaBuilder) => Knex.SchemaBuilder;
  readonly materializedView?: string;
}

const makeJSONField = (field: Field) => {
  const fieldType = field.type;
  let type;
  switch (fieldType.type) {
    case 'id':
    case 'foreignID':
      type = field.required ? ['string', 'integer'] : ['string', 'integer', 'null'];

      return { ...fieldType, type };
    case 'string':
      type = field.required ? 'string' : ['string', 'null'];
      if (fieldType.enum) {
        // tslint:disable-next-line no-unused
        const { enum: deleted, ...copiedFieldType } = { ...fieldType, type };
        // @ts-ignore
        const enumType = field.required ? fieldType.enum : fieldType.enum.concat([undefined]);

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
      return undefined;
    default:
      throw new Error(`Unknown field type: ${JSON.stringify(fieldType)}`);
  }
};
export const makeJSONSchema = (fieldSchema: FieldSchema): JsonSchema => {
  const required = Object.entries(fieldSchema)
    .filter(
      // tslint:disable-next-line no-unused
      ([__, field]) =>
        field.required &&
        !field.computed &&
        !field.auto &&
        // @ts-ignore
        field.type.default == undefined,
    )
    // tslint:disable-next-line no-unused
    .map(([fieldName, __]) => fieldName);

  const properties = Object.entries(fieldSchema).reduce<{}>((acc, [fieldName, field]: [string, Field]) => {
    if (!field.computed) {
      const jsonField = makeJSONField(field);
      if (jsonField !== undefined) {
        return { ...acc, [fieldName]: jsonField };
      }
    }

    return acc;
  }, {});

  return {
    type: 'object',
    required: required.length ? required : undefined,
    properties,
  };
};

export const makeRelationMappings = (edgeSchema: EdgeSchema | undefined): RelationMappings => {
  if (edgeSchema === undefined) {
    return {};
  }

  return Object.entries(edgeSchema).reduce<RelationMappings>(
    (acc, [edgeName, edge]) => ({
      ...acc,
      [edgeName]: edge.relation,
    }),
    {},
  );
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
      return `varchar(${fieldType.maxLength === undefined ? 255 : fieldType.maxLength})`;
    case 'number':
      return 'float8';
    case 'boolean':
      return 'boolean';
    default:
      throw new Error(`Unknown field type: ${fieldType.type}`);
  }
};

const isBigIntID = (modelSchemas: { readonly [modelName: string]: ModelSchema }, modelType: string): boolean =>
  // tslint:disable-next-line strict-type-predicates
  modelSchemas[modelType].fields.id !== undefined &&
  modelSchemas[modelType].fields.id.type.type === 'id' &&
  // @ts-ignore
  modelSchemas[modelType].fields.id.type.big;

const isAnyBigIntID = (
  modelSchemas: { readonly [modelName: string]: ModelSchema },
  modelType: string | ReadonlyArray<string>,
) => {
  if (typeof modelType === 'string') {
    return isBigIntID(modelSchemas, modelType);
  }

  return _.some(modelType.map((modelTpe) => isBigIntID(modelSchemas, modelTpe)));
};

const addColumn = (
  db: Knex,
  table: Knex.CreateTableBuilder,
  fieldName: string,
  field: Field,
  modelSchemas: { readonly [modelName: string]: ModelSchema },
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
        col = fieldType.big ? table.bigIncrements(fieldName) : table.increments(fieldName);
        col
          .primary()
          .unique()
          .notNullable()
          .unsigned();
        break;
      case 'foreignID':
        col = isAnyBigIntID(modelSchemas, fieldType.modelType) ? table.bigInteger(fieldName) : table.integer(fieldName);
        col.unsigned();
        break;
      case 'integer':
        col = table.integer(fieldName);
        if (fieldType.minimum !== undefined && fieldType.minimum >= 0) {
          col.unsigned();
        }
        break;
      case 'bigInteger':
        col = table.bigInteger(fieldName);
        if (fieldType.minimum !== undefined && fieldType.minimum >= 0) {
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
        col = table.specificType(fieldName, `${getColumnType(fieldType.items)}[]`);

        break;
      case 'json':
        col = table.jsonb(fieldName);
        break;
      case 'model':
        throw new Error(`Models/Interfaces cannot be columns in the Model. See ${fieldName}`);
      case 'tsvector':
        // @ts-ignore
        col = table
          .specificType(fieldName, 'tsvector')
          .notNullable()
          .index('GIN');
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

  // @ts-ignore
  if (fieldType.default !== undefined) {
    // @ts-ignore
    col.defaultTo(fieldType.default);
  }
};

const getCreateIndex = (index: IndexSchema, tableName: string) => {
  if (index.type === 'order') {
    const orderCols = index.columns.map((col) => `${col.name} ${col.order}`).join(', ');
    let orderUnique = '';
    if (index.unique) {
      orderUnique = 'UNIQUE ';
    }

    return `
      CREATE ${orderUnique}INDEX IF NOT EXISTS ${index.name} ON ${tableName} (${orderCols});
    `;
  }

  const cols = index.columnNames.map((col) => `${col}`).join(', ');
  let unique = '';
  if (index.unique) {
    unique = 'UNIQUE ';
  }

  return `
    CREATE ${unique}INDEX IF NOT EXISTS ${index.name} ON ${tableName} (${cols});
  `;
};

export const createTable = async (
  db: Knex,
  modelSchema: ModelSchema,
  modelSchemas: { readonly [modelType: string]: ModelSchema },
  bare?: boolean,
) => {
  const schema = db.schema;
  let executeSchema;
  if (modelSchema.materializedView !== undefined) {
    // tslint:disable-next-line no-non-null-assertion
    executeSchema = (currentSchema: Knex.SchemaBuilder) => currentSchema.raw(modelSchema.materializedView!);
  } else {
    executeSchema = (currentSchema: Knex.SchemaBuilder) => {
      currentSchema.createTable(modelSchema.tableName, (table) => {
        Object.entries(modelSchema.fields).forEach(([fieldName, field]) => {
          if (!field.computed) {
            addColumn(db, table, fieldName, field, modelSchemas);
          }
        });
        if (!bare) {
          if (_.isEqual(modelSchema.id, ['id1', 'id2'])) {
            table.primary(['id1', 'id2']);
          }
          modelSchema.indices.forEach((index) => {
            if (index.type === 'simple') {
              if (index.unique) {
                table.unique([...index.columnNames], index.name);
              } else {
                table.index([...index.columnNames], index.name);
              }
            } else if (index.type === 'order' && isSqlite(db)) {
              const columns = index.columns.map((col) => col.name);
              if (index.unique) {
                table.unique(columns, index.name);
              } else {
                table.index(columns, index.name);
              }
            }
          });
        }
      });

      if (!bare && isPostgres(db)) {
        modelSchema.indices.forEach((index) => {
          if (index.type === 'order') {
            currentSchema.raw(getCreateIndex(index, modelSchema.tableName));
          }
        });
      }

      return currentSchema;
    };
  }

  const exists = await schema.queryContext(makeAllPowerfulQueryContext()).hasTable(modelSchema.tableName);
  if (!exists) {
    if (bare) {
      await executeSchema(schema);
    } else {
      await modelSchema.chainCustomAfter(executeSchema(modelSchema.chainCustomBefore(schema)));
    }
  }
};

export const dropTable = async (db: Knex, modelSchema: ModelSchema, checkEmpty = false) => {
  const schema = db.schema;
  if (modelSchema.materializedView === undefined) {
    if (checkEmpty) {
      const exists = await schema.queryContext(makeAllPowerfulQueryContext()).hasTable(modelSchema.tableName);
      if (!exists) {
        return;
      }

      const result = await db(modelSchema.tableName)
        .select('*')
        .limit(1)
        .queryContext(makeAllPowerfulQueryContext());
      if (result.length === 0) {
        return;
      }
    }
    await schema.dropTableIfExists(modelSchema.tableName).queryContext(makeAllPowerfulQueryContext());
  } else {
    await schema
      .raw(
        `
      DROP MATERIALIZED VIEW IF EXISTS ${modelSchema.tableName} CASCADE;
    `,
      )
      .queryContext(makeAllPowerfulQueryContext());
  }
};

const EMPTY_DROP_INDICES = 'query string argument of EXECUTE is null';

export const dropIndices = async (db: Knex, tableName: string) => {
  if (db.client.driverName !== 'pg') {
    throw new Error('Not implemented');
  }
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
      .queryContext(makeAllPowerfulQueryContext());
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
      .queryContext(makeAllPowerfulQueryContext());
  } catch (error) {
    if (!error.message.includes(EMPTY_DROP_INDICES)) {
      throw error;
    }
  }
};

export const createIndices = async (db: Knex, modelSchema: ModelSchema) => {
  await Promise.all(
    modelSchema.indices.map((index) =>
      db.raw(getCreateIndex(index, modelSchema.tableName)).queryContext(makeAllPowerfulQueryContext()),
    ),
  );
};

export const refreshTriggers = async (db: Knex, modelSchema: ModelSchema) => {
  await modelSchema
    .chainCustomAfter(modelSchema.chainCustomBefore(db.schema))
    .queryContext(makeAllPowerfulQueryContext());
};
