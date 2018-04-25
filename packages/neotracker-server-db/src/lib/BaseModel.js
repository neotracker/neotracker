/* @flow */
import { CodedError } from 'neotracker-server-utils';
import type DataLoader from 'dataloader';
import type { Monitor } from '@neo-one/monitor';
import type { Observable } from 'rxjs';

import { lcFirst } from 'change-case';

import Base from './Base';
import type {
  EdgeSchema,
  FieldSchema,
  IndexSchema,
  ModelSchema,
} from './common';
import type { GraphQLContext } from '../types';
import type IFace from './IFace';
import { Node } from './IFace';
import type { QueryContext } from './QueryContext';

export type CacheType = 'none' | 'blockchain';
export type ID = number | string;

export default class BaseModel<TID: ID> extends Base {
  created_at: number;
  updated_at: number;

  static +fieldSchema: FieldSchema;
  static +edgeSchema: EdgeSchema = {};
  static exposeGraphQL: boolean = false;
  static exposeGraphQLType: boolean = true;
  static interfaces: Array<Class<IFace>> = [];
  static bigIntID: boolean = false;
  static indices: Array<IndexSchema> = [];
  static cacheType: CacheType = 'none';
  static isModel = true;

  static get modelSchema(): ModelSchema {
    return {
      tableName: this.tableName,
      name: this.modelName,
      pluralName: this.pluralName,
      id: 'id',
      fields: {
        created_at: {
          type: { type: 'integer', minimum: 0 },
          required: true,
          auto: true,
          exposeGraphQL: true,
        },
        updated_at: {
          type: { type: 'integer', minimum: 0 },
          required: true,
          auto: true,
          exposeGraphQL: true,
        },
        ...this.fieldSchema,
      },
      edges: this.edgeSchema,
      exposeGraphQL: this.exposeGraphQL,
      exposeGraphQLType: this.exposeGraphQLType,
      interfaces: this.interfaces.concat([Node]),
      isEdge: false,
      indices: this.indices.concat([
        {
          type: 'simple',
          columnNames: ['id'],
          unique: true,
          name: `${this.tableName}_id`,
        },
      ]),
      chainCustomBefore: this.chainCustomBefore,
      chainCustomAfter: this.chainCustomAfter,
    };
  }

  async afterGet(context: QueryContext): Promise<void> {
    this.getLoader(context).prime(
      { id: this.id, monitor: context.monitor },
      this,
    );
  }

  async clearCache(context: QueryContext): Promise<void> {
    this.getLoader(context).clear({ id: this.id, monitor: context.monitor });
  }

  getLoader(
    context: QueryContext,
  ): DataLoader<{| id: TID, monitor: Monitor |}, ?BaseModel<TID>> {
    return this.constructor.getDataLoader(context);
  }

  static getDataLoader(
    context: QueryContext,
  ): DataLoader<{| id: TID, monitor: Monitor |}, ?BaseModel<TID>> {
    const modelName = `${lcFirst(this.modelSchema.name)}`;
    return (context.rootLoader.loaders[modelName]: $FlowFixMe);
  }

  getLoaderByField(
    context: QueryContext,
    fieldName: string,
  ): DataLoader<{| id: TID, monitor: Monitor |}, ?BaseModel<TID>> {
    return this.constructor.getDataLoaderByField(context, fieldName);
  }

  static getDataLoaderByField(
    context: QueryContext,
    fieldName: string,
  ): DataLoader<{| id: TID, monitor: Monitor |}, ?BaseModel<TID>> {
    const modelName = lcFirst(this.modelSchema.name);
    return (context.rootLoader.loadersByField[modelName][
      fieldName
    ]: $FlowFixMe);
  }

  getLoaderByEdge(
    context: QueryContext,
    edgeName: string,
  ): DataLoader<{| id: TID, monitor: Monitor |}, ?BaseModel<TID>> {
    return this.constructor.getDataLoaderByEdge(context, edgeName);
  }

  static getDataLoaderByEdge(
    context: QueryContext,
    edgeName: string,
  ): DataLoader<{| id: TID, monitor: Monitor |}, ?BaseModel<TID>> {
    const modelName = `${lcFirst(this.modelSchema.name)}`;
    // $FlowFixMe
    return context.rootLoader.loadersByEdge[modelName][edgeName];
  }

  static observable(
    obj: Object,
    args: Object,
    context: GraphQLContext,
    // eslint-disable-next-line
    info: any,
  ): Observable<any> {
    throw new CodedError(CodedError.PROGRAMMING_ERROR);
  }
}
