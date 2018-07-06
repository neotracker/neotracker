const NodeEnvironment = require('jest-environment-node');

class NEOTrackerBase {
  async _setup() {
    // do nothing
  }

  async _teardown() {
    // do nothing
  }
}

class EnvironmentBase extends NodeEnvironment {
  constructor(config, options) {
    super(config, options);
    this.testEnvironmentOptions = config.testEnvironmentOptions || {};
  }

  async setup() {
    await super.setup();
    const neotracker = this._createNEOTracker();
    await neotracker._setup();
    this.global.neotracker = neotracker;
  }

  async teardown() {
    if (this.global.neotracker !== undefined) {
      await this.global.neotracker._teardown();
    }
    await super.teardown();
  }

  runScript(script) {
    return super.runScript(script);
  }

  _createNEOTracker() {
    throw new Error('Not Implemented');
  }
}

module.exports.EnvironmentBase = EnvironmentBase;
module.exports.NEOTrackerBase = NEOTrackerBase;
