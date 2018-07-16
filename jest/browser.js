const base = require('./base');

module.exports = {
  ...base({ path: 'browser' }),
  testEnvironment:
    './packages/neotracker-server-test/src/jest/BrowserEnvironment.js',
  setupTestFrameworkScriptFile:
    './packages/neotracker-server-test/src/jest/setupBrowser.js',
};
