const base = require('./base');

module.exports = {
  ...base({ path: 'browser' }),
  snapshotSerializers: ['enzyme-to-json/serializer'],
  testEnvironment:
    './packages/neotracker-server-test/src/jest/BrowserEnvironment.js',
  setupFilesAfterEnv: [
    './packages/neotracker-server-test/src/jest/setupBrowser.js',
  ],
};
