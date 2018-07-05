// tslint:disable variable-name
import Knex from 'knex';
import { Constructor, ModelOptions, Pojo } from 'objection';
import { BaseEdge, BaseModel, QueryContext } from '../lib';

export class AddressToTransfer extends BaseEdge<string, string> {
  public static readonly modelName = 'AddressToTransfer';
  public static readonly id2Desc = true;

  public static get id1Type(): typeof BaseModel {
    // tslint:disable-next-line no-require-imports
    return require('./Address').Address;
  }

  public static get id2Type(): typeof BaseModel {
    // tslint:disable-next-line no-require-imports
    return require('./Transfer').Transfer;
  }

  public static async insertAll(
    db: Knex,
    context: QueryContext,
    values: ReadonlyArray<Partial<AddressToTransfer>>,
  ): Promise<void> {
    return this.insertAllBase(db, context, values, AddressToTransfer);
  }

  public static fromJson<M>(this: Constructor<M>, json: Pojo, opt?: ModelOptions): M {
    return super.fromJson(
      {
        ...json,
        id2: json.id2 == undefined ? undefined : String(json.id2),
      },
      opt,
      // tslint:disable-next-line no-any
    ) as any;
  }
}
