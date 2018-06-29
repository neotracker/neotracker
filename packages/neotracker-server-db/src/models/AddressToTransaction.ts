// tslint:disable variable-name
import { BaseEdge, BaseModel } from '../lib';

export class AddressToTransaction extends BaseEdge<string, string> {
  public static readonly modelName = 'AddressToTransaction';
  public static readonly id2Desc = true;

  public static get id1Type(): typeof BaseModel {
    // tslint:disable-next-line no-require-imports
    return require('./Address').Address;
  }

  public static get id2Type(): typeof BaseModel {
    // tslint:disable-next-line no-require-imports
    return require('./Transaction').Transaction;
  }
}
