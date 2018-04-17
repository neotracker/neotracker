/* @flow */
import Base from './Base';
import type BaseModel, { ID } from './BaseModel';
import { type IndexSchema, type ModelSchema } from './common';

export default class BaseEdge<TID1: ID, TID2: ID> extends Base {
  id1: TID1;
  id2: TID2;

  static +id1Type: Class<BaseModel<TID1>>;
  static +id2Type: Class<BaseModel<TID2>>;
  static +materializedView: ?string = null;
  static indices: Array<IndexSchema> = [];

  static get modelSchema(): ModelSchema {
    return {
      tableName: this.tableName,
      name: this.modelName,
      pluralName: this.pluralName,
      id: ['id1', 'id2'],
      fields: {
        id1: {
          type: this.id1Type.modelSchema.fields.id.type,
          required: true,
        },
        id2: {
          type: this.id2Type.modelSchema.fields.id.type,
          required: true,
        },
      },
      interfaces: [],
      isEdge: true,
      indices: [
        {
          type: 'simple',
          columnNames: ['id1', 'id2'],
          unique: true,
          name: `${this.tableName}_id1_id2`,
        },
        ...this.indices,
      ],
      chainCustomBefore: this.chainCustomBefore,
      chainCustomAfter: this.chainCustomAfter,
      materializedView:
        this.materializedView == null ? undefined : this.materializedView,
    };
  }
}
