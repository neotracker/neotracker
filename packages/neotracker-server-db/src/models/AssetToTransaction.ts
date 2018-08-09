// tslint:disable variable-name
import Knex from 'knex';
import { Constructor, ModelOptions, Pojo, QueryContext as ObjectionQueryContext } from 'objection';
import { BaseEdge, BaseModel, QueryContext } from '../lib';
import { convertJSON } from './convertJSON';

export class AssetToTransaction extends BaseEdge<string, string> {
  public static readonly modelName = 'AssetToTransaction';
  public static readonly id2Desc = true;

  public static get id1Type(): typeof BaseModel {
    // tslint:disable-next-line no-require-imports
    return require('./Asset').Asset;
  }

  public static get id2Type(): typeof BaseModel {
    // tslint:disable-next-line no-require-imports
    return require('./Transaction').Transaction;
  }

  public static async insertAll(
    db: Knex,
    context: QueryContext,
    values: ReadonlyArray<Partial<AssetToTransaction>>,
  ): Promise<void> {
    return this.insertAllBase(db, context, values, AssetToTransaction);
  }

  public static fromJson<M>(this: Constructor<M>, json: Pojo, opt?: ModelOptions): M {
    return super.fromJson(
      {
        ...json,
        id2: convertJSON(json.id2),
      },
      opt,
      // tslint:disable-next-line no-any
    ) as any;
  }
  public async $afterGet(context: ObjectionQueryContext): Promise<void> {
    await super.$afterGet(context);

    // tslint:disable no-object-mutation
    // @ts-ignore
    this.id2 = convertJSON(this.id2);
    // tslint:enable no-object-mutation
  }
}
