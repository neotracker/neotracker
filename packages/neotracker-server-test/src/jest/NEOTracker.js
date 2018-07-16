const fs = require('fs-extra');
const tmp = require('tmp');

class NEOTracker {
  constructor() {
    this.mutableCleanup = [];
  }

  async startDB() {
    return {
      client: 'sqlite3',
      connection: {
        filename: ':memory:',
      },
    };
  }

  addCleanup(callback) {
    this.mutableCleanup.push(callback);
  }

  async teardown() {
    await Promise.all(this.mutableCleanup.map(async (callback) => callback()));
  }

  createDir() {
    const dir = tmp.dirSync().name;
    this.addCleanup(async () => {
      await fs.remove(dir);
    });

    return dir;
  }
}
module.exports = NEOTracker;
module.exports.default = NEOTracker;
