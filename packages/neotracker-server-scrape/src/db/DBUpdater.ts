import { Context } from '../types';

export abstract class DBUpdater<TSave, TRevert> {
  public abstract save(context: Context, save: TSave): Promise<Context>;
  public abstract revert(context: Context, save: TRevert): Promise<Context>;
}
