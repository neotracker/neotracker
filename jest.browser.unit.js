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
  testPathIgnorePatterns: [
    '/node_modules/',
    '<rootDir>/packages/.*/__e2e__/.*',
    '<rootDir>/packages/.*/test.ts',
    '<rootDir>/cypress/.*',
  ],
  testRegex: '.*neotracker-shared-web-next.*\\.test\\.(jsx?|tsx?)$',
  transform: {
    '^.+\\.jsx?$': 'babel-jest',
    '^.+\\.tsx?$': 'ts-jest',
  },
  transformIgnorePatterns: ['<rootDir>/node_modules/'],
  setupTestFrameworkScriptFile:
    './packages/neotracker-server-test/src/jest/setup.ts',
};
