const base = require('./base');
const internal = require('./internal');

module.exports = {
  ...base({ path: 'e2e-internal' }),
  ...internal,
};
