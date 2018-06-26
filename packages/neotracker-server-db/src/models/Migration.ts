// tslint:disable variable-name
import { FieldSchema, IndexSchema } from '../lib';
import { BaseVisibleModel } from './BaseVisibleModel';

export class Migration extends BaseVisibleModel<number> {
  public static readonly modelName = 'Migration';
  public static readonly exposeGraphQL: boolean = false;
  public static readonly indices: ReadonlyArray<IndexSchema> = [
    {
      type: 'simple',
      columnNames: ['name'],
      name: 'name',
      unique: true,
    },
  ];
  public static readonly fieldSchema: FieldSchema = {
    id: {
      type: { type: 'id', big: false },
      required: true,
      exposeGraphQL: true,
      auto: true,
    },

    name: {
      type: { type: 'string' },
      required: true,
    },

    complete: {
      type: { type: 'boolean' },
      required: true,
    },

    data: {
      type: { type: 'string' },
    },
  };

  public readonly name!: string;
  public readonly complete!: boolean;
  public readonly data!: string;
}
