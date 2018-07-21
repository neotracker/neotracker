/* eslint-disable */
// WARNING: This function’s source is returned by a loader without transpilation.
// Do not use any unsupported by IE11+ features.

/**
 * Eval example code in a custom context:
 * - `require()` that allows you to require modules from Markdown examples (won’t work dinamically becasue we need
 *   to know all required modules in advance to be able to bundle them with the code).
 *
 * Also prepends a given `code` with a `header` (maps required context modules to local variables).
 */
module.exports = function(header, require, code) {
  const func = new Function('require', header + code);

  return func.bind(null, require);
};
