module.exports = {
  collectCoverageFrom: [
    'packages/*/src/**/*.(js|ts)',
    '!**/bin/**',
    '!**/__mocks__/**',
    '!**/__tests__/**',
    '!**/__data__/**',
    '!**/__e2e__/**',
  ],
  coveragePathIgnorePatterns: ['/node_modules/'],
  coverageReporters: ['json', 'lcov'],
  globals: {
    'ts-jest': {
      useBabelrc: true,
      tsConfigFile: 'tsconfig.cli.json',
    },
  },
  moduleFileExtensions: ['js', 'jsx', 'json', 'node', 'ts', 'tsx'],
  testEnvironment: './packages/neotracker-server-test/src/jest/Environment.js',
  testPathIgnorePatterns: [
    '/node_modules/',
    '<rootDir>/packages/.*/__e2e__/.*',
    '<rootDir>/packages/.*/test.ts',
  ],
  testRegex: '(/__tests__/.*|(\\.|/)(test|spec))\\.(jsx?|tsx?)$',
  transform: {
    '^.+\\.tsx?$': 'ts-jest',
  },
  transformIgnorePatterns: ['<rootDir>/node_modules/'],
  setupTestFrameworkScriptFile:
    './packages/neotracker-server-test/src/jest/setup.js',
};
