const base = require('./base');

module.exports = {
  ...base({ path: 'unit' }),
  testEnvironment:
    './packages/neotracker-server-test/src/jest/NodeEnvironment.js',
};
