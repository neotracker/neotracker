// tslint:disable variable-name
import { Constructor, ModelOptions, Pojo, QueryContext as ObjectionQueryContext } from 'objection';
import { FieldSchema, IndexSchema } from '../lib';
import { BaseVisibleModel } from './BaseVisibleModel';
import { convertJSONBoolean } from './convertJSON';

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

  public static fromJson<M>(this: Constructor<M>, json: Pojo, opt?: ModelOptions): M {
    return super.fromJson(
      {
        ...json,
        complete: convertJSONBoolean(json.complete),
      },
      opt,
      // tslint:disable-next-line no-any
    ) as any;
  }

  public readonly name!: string;
  public readonly complete!: boolean;
  public readonly data!: string;

  public async $afterGet(context: ObjectionQueryContext): Promise<void> {
    await super.$afterGet(context);

    // tslint:disable no-object-mutation
    // @ts-ignore
    this.complete = convertJSONBoolean(this.complete);
    // tslint:enable no-object-mutation
  }
}
