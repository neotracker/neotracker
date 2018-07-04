import { Monitor } from '@neo-one/monitor';
import { Context } from '../types';

export abstract class SameContextDBUpdater<TSave, TRevert> {
  public abstract async save(context: Context, monitor: Monitor, save: TSave): Promise<void>;
  public abstract async revert(context: Context, monitor: Monitor, save: TRevert): Promise<void>;
}
