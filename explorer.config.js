/* eslint-disable */

module.exports = {
  componentsDir: 'packages/neotracker-shared-web-next/src/components',
  tsconfig: 'tsconfig.json',
  proxies: {
    node:
      './packages/neotracker-shared-web-next/src/__tests__/data/proxies/node',
    browser: './packages/neotracker-shared-web-next/src/__tests__/data/proxies',
  },
};
