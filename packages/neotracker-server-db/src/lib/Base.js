/* @flow */
import { CodedError, ValidationError } from 'neotracker-server-utils';
import { Model } from 'objection';

import { snakeCase } from 'change-case';

import type { IDSchema, ModelSchema, UpdateOptions } from './common';
import type { AllPowerfulQueryContext, QueryContext } from './QueryContext';

import { makeJSONSchema, makeRelationMappings } from './common';

export default class Base extends Model {
  static pickJsonSchemaProperties: boolean = true;
  static modelName: string;
  static +modelSchema: ModelSchema;
  static jsonAttributes = [];

  static get pluralName(): string {
    return `${this.modelName}s`;
  }

  static get tableName(): string {
    return snakeCase(this.modelName);
  }

  static get idColumn(): IDSchema {
    return this.modelSchema.id;
  }

  static get jsonSchema(): Object {
    return makeJSONSchema(this.modelSchema.fields);
  }

  static get relationMappings(): Object {
    return makeRelationMappings(this.modelSchema.edges);
  }

  static chainCustomBefore(schema: any): any {
    return schema;
  }

  static chainCustomAfter(schema: any): any {
    return schema;
  }

  async $afterGet(
    context: AllPowerfulQueryContext | QueryContext,
  ): Promise<void> {
    this.checkContext(context);
    if (context.type === 'normal') {
      await this.afterGet(context);
    }
  }

  async $beforeInsert(
    context: AllPowerfulQueryContext | QueryContext,
  ): Promise<void> {
    this.checkContext(context);
    const checks = [this.validateCreate()];
    if (context.type === 'normal' && !context.isAllPowerful) {
      checks.push(this.checkCanCreate(context));
    }
    const results = await Promise.all(checks);
    const validation = results[0];
    if (validation != null) {
      throw new ValidationError(validation);
    }
  }

  async $afterInsert(
    context: AllPowerfulQueryContext | QueryContext,
  ): Promise<void> {
    this.checkContext(context);
    if (context.type === 'normal') {
      await Promise.all([this.clearCache(context), this.afterInsert(context)]);
    }
  }

  async $beforeUpdate(
    options: UpdateOptions,
    context: AllPowerfulQueryContext | QueryContext,
  ): Promise<void> {
    this.checkContext(context);
    const checks = [this.validateEdit(options)];
    if (context.type === 'normal' && !context.isAllPowerful) {
      checks.push(this.checkCanEdit(context, options));
    }
    const results = await Promise.all(checks);
    const validation = results[0];
    if (validation != null) {
      throw new ValidationError(validation);
    }
  }

  async $afterUpdate(
    options: UpdateOptions,
    context: QueryContext,
  ): Promise<void> {
    this.checkContext(context);
    if (context.type === 'normal') {
      await Promise.all([this.clearCache(context), this.afterUpdate(context)]);
    }
  }

  async $beforeDelete(context: QueryContext): Promise<void> {
    this.checkContext(context);
    if (context.type === 'normal' && !context.isAllPowerful) {
      await this.checkCanDelete(context);
    }
  }

  async $afterDelete(
    context: AllPowerfulQueryContext | QueryContext,
  ): Promise<void> {
    this.checkContext(context);
    if (context.type === 'normal') {
      await Promise.all([this.clearCache(context), this.afterDelete(context)]);
    }
  }

  async canView(context: QueryContext): Promise<boolean> {
    return context.isAllPowerful;
  }

  async validateCreate(): Promise<?string> {
    return null;
  }

  async checkCanCreate(context: QueryContext): Promise<void> {
    this.checkPermission(context, context.isAllPowerful);
  }

  // eslint-disable-next-line
  async validateEdit(options: UpdateOptions): Promise<?string> {
    return null;
  }

  async checkCanEdit(
    context: QueryContext,
    // eslint-disable-next-line
    options: UpdateOptions,
  ): Promise<void> {
    this.checkPermission(context, context.isAllPowerful);
  }

  async checkCanDelete(context: QueryContext): Promise<void> {
    this.checkPermission(context, context.isAllPowerful);
  }

  // eslint-disable-next-line
  async afterGet(context: QueryContext): Promise<void> {}

  // eslint-disable-next-line
  async clearCache(context: QueryContext): Promise<void> {}

  // eslint-disable-next-line
  async afterInsert(context: QueryContext): Promise<void> {}

  // eslint-disable-next-line
  async afterUpdate(context: QueryContext): Promise<void> {}

  // eslint-disable-next-line
  async afterDelete(context: QueryContext): Promise<void> {}

  checkPermission(context: QueryContext, can: boolean): void {
    if (!can) {
      throw new CodedError(CodedError.PERMISSION_DENIED);
    }
  }

  checkContext(context: AllPowerfulQueryContext | QueryContext): void {
    if (context == null || context.type == null) {
      throw new CodedError(CodedError.PROGRAMMING_ERROR);
    }
  }
}
