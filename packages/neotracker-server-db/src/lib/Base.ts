import { CodedError, ValidationError } from '@neotracker/server-utils';
import { snakeCase } from 'change-case';
import * as Knex from 'knex';
import { Model, ModelClass, ModelOptions, QueryContext as ObjectionQueryContext } from 'objection';
import { isPostgres, isUniqueError } from '../knexUtils';
import { IDSchema, makeJSONSchema, makeRelationMappings, ModelSchema } from './common';
import { QueryContext as LibQueryContext } from './QueryContext';

export class Base extends Model {
  public static readonly pickJsonSchemaProperties: boolean = true;
  public static readonly modelName: string;
  public static readonly modelSchema: ModelSchema;
  // tslint:disable-next-line readonly-array
  public static readonly jsonAttributes: string[] = [];

  public static get pluralName(): string {
    return `${this.modelName}s`;
  }

  public static get tableName(): string {
    if (this.mutableTableName === undefined) {
      this.mutableTableName = snakeCase(this.modelName);
    }

    return this.mutableTableName;
  }

  public static get idColumn(): IDSchema {
    return this.modelSchema.id;
  }

  public static get jsonSchema(): ReturnType<typeof makeJSONSchema> {
    return makeJSONSchema(this.modelSchema.fields);
  }

  public static get relationMappings(): ReturnType<typeof makeRelationMappings> {
    return makeRelationMappings(this.modelSchema.edges);
  }

  public static chainCustomBefore(schema: Knex.SchemaBuilder): Knex.SchemaBuilder {
    return schema;
  }

  public static chainCustomAfter(schema: Knex.SchemaBuilder): Knex.SchemaBuilder {
    return schema;
  }

  public static async insertAllBase<T extends Base>(
    db: Knex,
    context: LibQueryContext,
    values: ReadonlyArray<Partial<T>>,
    model: ModelClass<T>,
    forceSingle = false,
  ): Promise<void> {
    if (forceSingle || !isPostgres(db)) {
      await Promise.all(
        values.map(async (value) =>
          model
            .query(db)
            .context(context)
            .insert(value)
            .catch((error) => {
              if (!isUniqueError(db, error)) {
                throw error;
              }
            }),
        ),
      );
    } else {
      await model
        .query(db)
        .context(context)
        .insert([...values])
        .catch(async (error) => {
          if (isUniqueError(db, error)) {
            return this.insertAllBase(db, context, values, model, true);
          }

          throw error;
        });
    }
  }

  private static mutableTableName: string | undefined;

  public async $afterGet(context: ObjectionQueryContext): Promise<void> {
    this.checkContext(context);
    if (context.type === 'normal') {
      await this.afterGet(context);
    }
  }

  public async $beforeInsert(context: ObjectionQueryContext): Promise<void> {
    this.checkContext(context);
    const results = await Promise.all([
      this.validateCreate(),
      context.type === 'normal' && !context.isAllPowerful ? this.checkCanCreate(context) : Promise.resolve(),
    ]);
    const validation = results[0];
    if (validation !== undefined) {
      throw new ValidationError(validation);
    }
  }

  public async $afterInsert(context: ObjectionQueryContext): Promise<void> {
    this.checkContext(context);
    if (context.type === 'normal') {
      await Promise.all([this.clearCache(context), this.afterInsert(context)]);
    }
  }

  public async $beforeUpdate(options: ModelOptions, context: ObjectionQueryContext): Promise<void> {
    this.checkContext(context);
    const results = await Promise.all([
      this.validateEdit(options),
      context.type === 'normal' && !context.isAllPowerful ? this.checkCanEdit(context, options) : Promise.resolve(),
    ]);
    const validation = results[0];
    if (validation !== undefined) {
      throw new ValidationError(validation);
    }
  }

  public async $afterUpdate(_options: ModelOptions, context: ObjectionQueryContext): Promise<void> {
    this.checkContext(context);
    if (context.type === 'normal') {
      await Promise.all([this.clearCache(context), this.afterUpdate(context)]);
    }
  }

  public async $beforeDelete(context: ObjectionQueryContext): Promise<void> {
    this.checkContext(context);
    if (context.type === 'normal' && !context.isAllPowerful) {
      await this.checkCanDelete(context);
    }
  }

  public async $afterDelete(context: ObjectionQueryContext): Promise<void> {
    this.checkContext(context);
    if (context.type === 'normal') {
      await Promise.all([this.clearCache(context), this.afterDelete(context)]);
    }
  }

  public async canView(context: ObjectionQueryContext): Promise<boolean> {
    return context.isAllPowerful;
  }

  public async validateCreate(): Promise<string | undefined> {
    return undefined;
  }

  public async checkCanCreate(context: ObjectionQueryContext): Promise<void> {
    this.checkPermission(context, context.isAllPowerful);
    await Promise.resolve();
  }

  // eslint-disable-next-line
  public async validateEdit(_options: ModelOptions): Promise<string | undefined> {
    return undefined;
  }

  public async checkCanEdit(context: ObjectionQueryContext, _options: ModelOptions): Promise<void> {
    this.checkPermission(context, context.isAllPowerful);
    await Promise.resolve();
  }

  public async checkCanDelete(context: ObjectionQueryContext): Promise<void> {
    this.checkPermission(context, context.isAllPowerful);
    await Promise.resolve();
  }

  public async afterGet(_context: ObjectionQueryContext): Promise<void> {
    await Promise.resolve();
  }

  public async clearCache(_context: ObjectionQueryContext): Promise<void> {
    await Promise.resolve();
  }

  public async afterInsert(_context: ObjectionQueryContext): Promise<void> {
    await Promise.resolve();
  }

  public async afterUpdate(_context: ObjectionQueryContext): Promise<void> {
    await Promise.resolve();
  }

  public async afterDelete(_context: ObjectionQueryContext): Promise<void> {
    await Promise.resolve();
  }

  public checkPermission(_context: ObjectionQueryContext, can: boolean): void {
    if (!can) {
      throw new CodedError(CodedError.PERMISSION_DENIED);
    }
  }

  public checkContext(context: ObjectionQueryContext | undefined): void {
    if (context === undefined || context.type === undefined) {
      throw new CodedError(CodedError.PROGRAMMING_ERROR);
    }
  }
}
