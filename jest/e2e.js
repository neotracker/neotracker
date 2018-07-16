const base = require('./base');

module.exports = {
  ...base({ path: 'e2e' }),
  testEnvironment:
    './packages/neotracker-server-test/src/jest/NodeEnvironment.js',
};
