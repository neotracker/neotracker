// tslint:disable variable-name
import { CodedError } from '@neotracker/server-utils';
import { lcFirst } from 'change-case';
import DataLoader from 'dataloader';
import { QueryContext } from 'objection';
import { Observable } from 'rxjs';
import { GraphQLContext } from '../types';
import { Base } from './Base';
import { EdgeSchema, FieldSchema, IndexSchema, ModelSchema } from './common';
import { IFace, Node } from './IFace';
export type CacheType = 'none' | 'blockchain';
export type ID = number | string;

export class BaseModel<TID extends ID = ID> extends Base {
  public static readonly fieldSchema: FieldSchema;
  public static readonly edgeSchema: EdgeSchema = {};
  public static readonly exposeGraphQL: boolean = false;
  public static readonly exposeGraphQLType: boolean = true;
  public static readonly interfaces: ReadonlyArray<IFace> = [];
  public static readonly indices: ReadonlyArray<IndexSchema> = [];
  public static readonly cacheType: CacheType = 'none';
  public static readonly isModel = true;
  public static readonly idDesc: boolean = false;

  public static getDataLoader<TID extends ID>(
    context: QueryContext,
  ): DataLoader<{ readonly id: TID }, BaseModel<TID> | undefined> {
    const modelName = `${lcFirst(this.modelSchema.name)}`;

    return context.rootLoader.loaders[modelName];
  }

  public static getDataLoaderByField<TID extends ID>(
    context: QueryContext,
    fieldName: string,
  ): DataLoader<{ readonly id: TID }, BaseModel<TID> | undefined> {
    const modelName = lcFirst(this.modelSchema.name);

    return context.rootLoader.loadersByField[modelName][fieldName];
  }

  public static getDataLoaderByEdge<TID extends ID>(
    context: QueryContext,
    edgeName: string,
  ): DataLoader<{ readonly id: TID }, BaseModel<TID> | undefined> {
    const modelName = `${lcFirst(this.modelSchema.name)}`;

    return context.rootLoader.loadersByEdge[modelName][edgeName];
  }

  // tslint:disable no-any
  public static observable$(_obj: any, _args: any, _context: GraphQLContext, _info: any): Observable<any> {
    throw new CodedError(CodedError.PROGRAMMING_ERROR);
  }
  // tslint:enable no-any

  public static get modelSchema(): ModelSchema {
    if (this.mutableModelSchema === undefined) {
      this.mutableModelSchema = {
        tableName: this.tableName,
        name: this.modelName,
        pluralName: this.pluralName,
        id: 'id',
        fields: {
          ...this.fieldSchema,
        },

        edges: this.edgeSchema,
        exposeGraphQL: this.exposeGraphQL,
        exposeGraphQLType: this.exposeGraphQLType,
        interfaces: this.interfaces.concat([Node]),
        isEdge: false,
        indices: this.indices.concat([
          {
            type: 'order',
            columns: [
              {
                name: 'id',
                order: this.idDesc ? 'desc' : 'asc',
              },
            ],

            unique: true,
            name: `${this.tableName}_id`,
          },
        ]),

        chainCustomBefore: this.chainCustomBefore,
        chainCustomAfter: this.chainCustomAfter,
      };
    }

    return this.mutableModelSchema;
  }

  private static mutableModelSchema: ModelSchema | undefined;

  public readonly id!: TID;

  public async afterGet(context: QueryContext): Promise<void> {
    this.getLoader(context).prime({ id: this.id }, this);
    await Promise.resolve();
  }

  public async clearCache(context: QueryContext): Promise<void> {
    this.getLoader(context).clear({ id: this.id });
    await Promise.resolve();
  }

  public getLoader(context: QueryContext): DataLoader<{ readonly id: TID }, BaseModel<TID> | undefined> {
    return (this.constructor as typeof BaseModel).getDataLoader<TID>(context);
  }

  public getLoaderByField(
    context: QueryContext,
    fieldName: string,
  ): DataLoader<{ readonly id: TID }, BaseModel<TID> | undefined> {
    return (this.constructor as typeof BaseModel).getDataLoaderByField(context, fieldName);
  }

  public getLoaderByEdge(
    context: QueryContext,
    edgeName: string,
  ): DataLoader<{ readonly id: TID }, BaseModel<TID> | undefined> {
    return (this.constructor as typeof BaseModel).getDataLoaderByEdge<TID>(context, edgeName);
  }
}
