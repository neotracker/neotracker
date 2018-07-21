require('source-map-support').install({ environment: 'node' });
require('ts-node/register/transpile-only');

// eslint-disable-next-line
module.exports = require('./index').default;
