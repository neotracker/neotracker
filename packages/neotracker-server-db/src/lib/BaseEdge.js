/* @flow */
import Base from './Base';
import type BaseModel from './BaseModel';
import { type IndexSchema, type ModelSchema } from './common';

export default class BaseEdge extends Base {
  id1: number;
  id2: number;

  static +id1Type: Class<BaseModel>;
  static +id2Type: Class<BaseModel>;
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
          type: { type: 'foreignID', modelType: this.id1Type.modelSchema.name },
          required: true,
        },
        id2: {
          type: { type: 'foreignID', modelType: this.id2Type.modelSchema.name },
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
