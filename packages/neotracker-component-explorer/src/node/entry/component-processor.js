/* eslint-disable */
require('source-map-support').install({ environment: 'node' });
require('ts-node/register/transpile-only');

const { createProcessor } = require('../component/processor/createProcessor');

process.on('uncaughtException', (err) => {
  console.log('UNCAUGHT EXCEPTION in awesome-typescript-loader');
  console.log("[Inside 'uncaughtException' event] ", err.message, err.stack);
});

process.on('disconnect', () => {
  process.exit(0);
});

createProcessor(
  process.on.bind(process, 'message'),
  process.send.bind(process),
);
