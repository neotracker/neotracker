const fs = require('fs-extra');
const tmp = require('tmp');

class NEOTracker {
  constructor() {
    this.mutableCleanup = [];
    this.mutableTeardownCleanup = [];
  }

  async startDB() {
    return {
      db: {
        client: 'sqlite3',
        connection: {
          filename: ':memory:',
        },
      },
    };
  }

  addCleanup(callback) {
    this.mutableCleanup.push(callback);
  }

  addTeardownCleanup(callback) {
    this.mutableTeardownCleanup.push(callback);
  }

  async cleanupTest() {
    const cleanup = this.mutableCleanup;
    this.mutableCleanup = [];
    await Promise.all(cleanup.map(async (callback) => callback()));
  }

  async teardown() {
    await Promise.all([
      this.cleanupTest(),
      Promise.all(
        this.mutableTeardownCleanup.map(async (callback) => callback()),
      ),
    ]);
  }

  createDir() {
    const dir = tmp.dirSync().name;
    this.addTeardownCleanup(async () => {
      await fs.remove(dir);
    });

    return dir;
  }
}
module.exports = NEOTracker;
module.exports.default = NEOTracker;
