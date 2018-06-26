import { Base } from './Base';
import { BaseModel, ID } from './BaseModel';
import { IndexSchema, ModelSchema } from './common';

export class BaseEdge<TID1 extends ID, TID2 extends ID> extends Base {
  public static readonly id1Type: typeof BaseModel;
  public static readonly id2Type: typeof BaseModel;
  public static readonly materializedView: string | undefined;
  public static readonly id2Desc: boolean = false;
  public static readonly indices: ReadonlyArray<IndexSchema> = [];
  public readonly id1!: TID1;
  public readonly id2!: TID2;

  public static get modelSchema(): ModelSchema {
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
          type: 'order',
          columns: [
            {
              name: 'id1',
              order: 'asc',
            },

            {
              name: 'id2',
              order: this.id2Desc ? 'desc' : 'asc',
            },
          ],

          unique: true,
          name: `${this.tableName}_id1_id2`,
        },

        ...this.indices,
      ],

      chainCustomBefore: this.chainCustomBefore,
      chainCustomAfter: this.chainCustomAfter,
      materializedView: this.materializedView === undefined ? undefined : this.materializedView,
    };
  }
}
