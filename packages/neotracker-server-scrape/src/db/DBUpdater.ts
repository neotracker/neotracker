import { Monitor } from '@neo-one/monitor';
import { DBContext } from '../types';
import { isUniqueError } from './utils';

export abstract class DBUpdater<TSave, TRevert, TSaveValue = void, TRevertValue = void> {
  public constructor(protected readonly context: DBContext) {}

  public abstract save(monitor: Monitor, save: TSave): Promise<TSaveValue>;
  public abstract revert(monitor: Monitor, save: TRevert): Promise<TRevertValue>;

  public async close(): Promise<void> {
    // do nothing
  }

  protected isUniqueError(error: NodeJS.ErrnoException): boolean {
    return isUniqueError(this.context.db, error);
  }
}
