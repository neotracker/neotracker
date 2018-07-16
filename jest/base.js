module.exports = ({ path }) => ({
  displayName: path,
  rootDir: '../',
  globals: {
    'ts-jest': {
      babel: {
        plugins: ['babel-plugin-jest-hoist'],
        sourceMaps: 'inline',
      },
      tsConfigFile: 'tsconfig.jest.json',
    },
  },
  moduleFileExtensions: ['js', 'jsx', 'json', 'node', 'ts', 'tsx'],
  moduleNameMapper: {
    '^@neo-one/ec-key': '@neo-one/ec-key',
    '^@neo-one/boa': '@neo-one/boa',
    '^@neo-one/csharp': '@neo-one/csharp',
    '^@neo-one/(.+)-es2018-cjs': '@neo-one/$1-es2018-cjs',
    '^@neo-one/(.+)': '@neo-one/$1-es2018-cjs',
    '^@reactivex/ix-esnext-esm(.*)': '@reactivex/ix-esnext-cjs$1',
  },
  testRegex: `^.*/__tests__/${path}/.*\\.test\\.tsx?$`,
  testPathIgnorePatterns: ['/node_modules/'],
  transform: {
    '^.+\\.tsx?$': 'ts-jest',
  },
  setupTestFrameworkScriptFile:
    './packages/neotracker-server-test/src/jest/setup.js',
});
