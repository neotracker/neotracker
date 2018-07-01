const fs = require('fs-extra');
const tmp = require('tmp');
const path = require('path');

const { EnvironmentBase, NEOTrackerBase } = require('./EnvironmentBase');

class NEOTracker extends NEOTrackerBase {
  constructor() {
    super();
    this.dirs = [];
  }

  async startDB() {
    const dir = this._createDir();

    return {
      client: 'sqlite3',
      connection: {
        filename: path.resolve(dir, 'db.sqlite'),
      },
    };
  }

  async _teardown() {
    await Promise.all(
      this.dirs.map(async (dir) => {
        await fs.remove(dir);
      }),
    );
  }

  _createDir() {
    const dir = tmp.dirSync().name;
    this.dirs.push(dir);

    return dir;
  }
}

class UnitEnvironment extends EnvironmentBase {
  _createNEOTracker() {
    return new NEOTracker();
  }
}

module.exports = UnitEnvironment;
