import Knex from 'knex';
import * as path from 'path';
import { EnvironmentBase, NEOTrackerBase } from './EnvironmentBase';

class NEOTracker extends NEOTrackerBase {
  public async startDB(): Promise<Knex.Config> {
    const dir = this.createDir();

    return {
      client: 'sqlite3',
      connection: {
        filename: path.resolve(dir, 'db.sqlite'),
      },
    };
  }
}

class Environment extends EnvironmentBase {
  protected createNEOTracker(): NEOTrackerBase {
    return new NEOTracker();
  }
}

export = Environment;
