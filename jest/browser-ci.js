const browser = require('./browser');
const ci = require('./ci');

module.exports = {
  ...browser,
  ...ci('browser'),
};
