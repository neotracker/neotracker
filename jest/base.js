module.exports = ({ path }) => ({
  displayName: path,
  rootDir: '../',
  globals: {
    'ts-jest': {
      babel: {
        plugins: ['babel-plugin-jest-hoist'],
        sourceMaps: 'inline',
      },
      tsConfig: 'tsconfig.jest.json',
    },
  },
  moduleFileExtensions: ['js', 'jsx', 'json', 'node', 'ts', 'tsx'],
  moduleNameMapper: {
    '^@reactivex/ix-esnext-esm(.*)': '@reactivex/ix-esnext-cjs$1',
  },
  testRegex: `^.*/__tests__/${path}/.*\\.test\\.tsx?$`,
  testPathIgnorePatterns: ['/node_modules/'],
  transform: {
    '^.+\\.tsx?$': 'ts-jest',
  },
  setupFilesAfterEnv: ['./packages/neotracker-server-test/src/jest/setup.js'],
});
