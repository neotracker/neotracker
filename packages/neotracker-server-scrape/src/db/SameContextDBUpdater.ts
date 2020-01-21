import { Context } from '../types';

export abstract class SameContextDBUpdater<TSave, TRevert> {
  public abstract async save(context: Context, save: TSave): Promise<void>;
  public abstract async revert(context: Context, save: TRevert): Promise<void>;
}
