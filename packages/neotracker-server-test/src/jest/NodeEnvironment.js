const JestNodeEnvironment = require('jest-environment-node');

const NEOTracker = require('./NEOTracker');

class NodeEnvironment extends JestNodeEnvironment {
  constructor(config, options) {
    super(config, options);
    this.testEnvironmentOptions =
      // eslint-disable-next-line
      config.testEnvironmentOptions == undefined
        ? {}
        : config.testEnvironmentOptions;
  }

  async setup() {
    await super.setup();
    this.global.neotracker = this.createNEOTracker();
  }

  async teardown() {
    if (this.global.neotracker !== undefined) {
      await this.global.neotracker.teardown();
    }
    await super.teardown();
  }

  createNEOTracker() {
    return new NEOTracker();
  }
}
module.exports = NodeEnvironment;
module.exports.default = NodeEnvironment;
