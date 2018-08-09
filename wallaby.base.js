/* eslint-disable */

module.exports = function({ browser }) {
  return function(wallaby) {
    const compilers = {
      '**/*.ts?(x)': wallaby.compilers.typeScript({
        typescript: require('typescript'),
        ...require('./tsconfig.json').compilerOptions,
        ...require('./tsconfig/tsconfig.build.json').compilerOptions,
        ...require('./tsconfig/tsconfig.cjs.json').compilerOptions,
        ...require('./tsconfig/tsconfig.es2018.cjs.json').compilerOptions,
        ...require('./tsconfig.jest.json').compilerOptions,
      }),
    };

    if (!browser) {
      compilers['**/*.js?(x)'] = wallaby.compilers.babel({
        presets: [
          '@babel/preset-react',
          [
            '@babel/preset-env',
            {
              targets: { node: true },
              modules: 'commonjs',
              useBuiltIns: 'usage',
              ignoreBrowserslistConfig: true,
            },
          ],
        ],
        plugins: [
          'babel-plugin-relay',
          '@babel/proposal-class-properties',
          '@babel/plugin-proposal-export-namespace-from',
          '@babel/plugin-transform-flow-strip-types',
        ],
      });
    }

    const commonFiles = [
      { pattern: 'tsconfig.json', instrument: false },
      { pattern: '@types/**/*', instrument: false },
      { pattern: 'node_modules/@types/**/*', instrument: false },
      { pattern: 'jest/**/*', instrument: false },
      { pattern: 'packages/**/jest/*.js', instrument: false },
      'packages/*/package.json',
    ];
    const unitFiles = [
      'packages/*/src/**/*.ts?(x)',
      'packages/*/src/**/*.js?(x)',
      'packages/*/src/**/*.snap',
    ];
    const browserFiles = [
      { pattern: 'explorer.config.js', instrument: false },
      {
        pattern:
          'packages/neotracker-server-graphql/src/__generated__/schema.graphql.json',
        instrument: false,
      },
      'packages/neotracker-component-explorer/src/**/*.ts?(x)',
      'packages/neotracker-component-explorer/src/**/*.js?(x)',
      'packages/neotracker-shared-web-next/src/**/*.ts?(x)',
      'packages/neotracker-shared-web-next/src/**/*.js?(x)',
      'packages/neotracker-shared-web-next/src/**/*.snap',
      'packages/neotracker-shared-utils/src/**/*.ts?(x)',
      'packages/neotracker-shared-test/src/**/*.ts?(x)',
    ];
    const commonNegatedFiles = [
      '!packages/*/src/**/__tests__/browser/**/*.test.ts',
      '!packages/*/src/**/__tests__/unit/**/*.test.ts',
      '!packages/*/src/**/__tests__/e2e/**/*.test.ts',
      '!packages/*/src/**/__tests__/e2e-internal/**/*.test.ts',
    ];
    const unitNegatedFiles = ['!packages/*/src/**/*.examples.ts?(x)'];
    const browserNegatedFiles = [];
    const files = browser ? browserFiles : unitFiles;
    const negatedFiles = browser ? browserNegatedFiles : unitNegatedFiles;

    return {
      files: commonFiles
        .concat(files)
        .concat(commonNegatedFiles)
        .concat(negatedFiles),
      tests: browser
        ? ['packages/*/src/__tests__/browser/**/*.test.ts?(x)']
        : ['packages/*/src/__tests__/unit/**/*.test.ts?(x)'].concat([
            'packages/neotracker-server-scrape/src/__tests__/e2e/**/*.test.ts?(x)',
          ]),
      env: {
        type: 'node',
        runner: 'node',
      },
      testFramework: 'jest',
      compilers,
      preprocessors: {
        '**/*.test.js?(x)': (file) =>
          require('@babel/core').transform(file.content, {
            sourceMap: true,
            filename: file.path,
            plugins: ['babel-plugin-jest-hoist'],
          }),
      },
      setup: function(wallaby) {
        var jestConfig = wallaby.tests.some((t) =>
          t.includes('__tests__/browser'),
        )
          ? require('./jest/browser.js')
          : require('./jest/unit.js');
        jestConfig.moduleNameMapper = {
          ...jestConfig.moduleNameMapper,
          '^@neotracker-internal/(.+)':
            wallaby.projectCacheDir + '/packages/neotracker-internal-$1/src',
          '^@neotracker/(.+)':
            wallaby.projectCacheDir + '/packages/neotracker-$1/src',
        };
        jestConfig.transform = {};
        delete jestConfig.rootDir;
        wallaby.testFramework.configure(jestConfig);
      },
    };
  };
};
