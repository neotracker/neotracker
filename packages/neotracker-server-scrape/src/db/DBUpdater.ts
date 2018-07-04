import { Monitor } from '@neo-one/monitor';
import { Context } from '../types';

export abstract class DBUpdater<TSave, TRevert> {
  public abstract save(context: Context, monitor: Monitor, save: TSave): Promise<Context>;
  public abstract revert(context: Context, monitor: Monitor, save: TRevert): Promise<Context>;
}
