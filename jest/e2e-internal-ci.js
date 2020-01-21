const e2e = require('./e2e-ci');
const internal = require('./internal');

module.exports = {
  ...e2e,
  ...internal,
};
