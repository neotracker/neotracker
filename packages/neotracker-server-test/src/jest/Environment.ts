import * as fs from 'fs-extra';
import Knex from 'knex';
import * as path from 'path';
import * as tmp from 'tmp';
import { EnvironmentBase, NEOTrackerBase } from './EnvironmentBase';

class NEOTracker extends NEOTrackerBase {
  private readonly mutableDirs: string[] = [];

  public async startDB(): Promise<Knex.Config> {
    const dir = this.createDir();

    return {
      client: 'sqlite3',
      connection: {
        filename: path.resolve(dir, 'db.sqlite'),
      },
    };
  }

  public async teardown(): Promise<void> {
    await Promise.all(
      this.mutableDirs.map(async (dir) => {
        await fs.remove(dir);
      }),
    );
  }

  private createDir(): string {
    const dir = tmp.dirSync().name;
    this.mutableDirs.push(dir);

    return dir;
  }
}

class Environment extends EnvironmentBase {
  protected createNEOTracker(): NEOTrackerBase {
    return new NEOTracker();
  }
}

export = Environment;
