const base = require('./base');

module.exports = {
  ...base({ path: 'e2e-internal' }),
  testEnvironment:
    './packages/neotracker-internal-server-test/src/jest/NodeEnvironment.js',
};
