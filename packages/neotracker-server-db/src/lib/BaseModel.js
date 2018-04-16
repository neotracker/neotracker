/* @flow */
import { CodedError } from 'neotracker-server-utils';
import type DataLoader from 'dataloader';
import type { Monitor } from '@neo-one/monitor';
import type { Observable } from 'rxjs/Observable';

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

export default class BaseModel extends Base {
  id: number;
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
        id: { type: { type: 'id', big: this.bigIntID }, exposeGraphQL: true },
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
      indices: this.indices,
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
  ): DataLoader<{| id: number, monitor: Monitor |}, ?BaseModel> {
    return this.constructor.getDataLoader(context);
  }

  static getDataLoader(
    context: QueryContext,
  ): DataLoader<{| id: number, monitor: Monitor |}, ?BaseModel> {
    const modelName = `${lcFirst(this.modelSchema.name)}`;
    return context.rootLoader.loaders[modelName];
  }

  getLoaderByField(
    context: QueryContext,
    fieldName: string,
  ): DataLoader<{| id: number, monitor: Monitor |}, ?BaseModel> {
    return this.constructor.getDataLoaderByField(context, fieldName);
  }

  static getDataLoaderByField(
    context: QueryContext,
    fieldName: string,
  ): DataLoader<{| id: number, monitor: Monitor |}, ?BaseModel> {
    const modelName = lcFirst(this.modelSchema.name);
    return context.rootLoader.loadersByField[modelName][fieldName];
  }

  getLoaderByEdge(
    context: QueryContext,
    edgeName: string,
  ): DataLoader<{| id: number, monitor: Monitor |}, ?BaseModel> {
    return this.constructor.getDataLoaderByEdge(context, edgeName);
  }

  static getDataLoaderByEdge(
    context: QueryContext,
    edgeName: string,
  ): DataLoader<{| id: number, monitor: Monitor |}, ?BaseModel> {
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
