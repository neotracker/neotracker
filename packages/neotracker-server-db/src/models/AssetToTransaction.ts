// tslint:disable variable-name
import { BaseEdge, BaseModel } from '../lib';

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
}
