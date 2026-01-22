module.exports = {
  testEnvironment: 'node',
  testMatch: [
    '**/__tests__/**/*.test.{js,ts}',
    '**/tests/**/*.test.{js,ts}',
  ],
  collectCoverageFrom: [
    'server/**/*.{js,ts}',
    '!server/**/index.{js,ts}',
    '!**/node_modules/**',
    '!**/dist/**',
  ],
  coverageDirectory: 'coverage',
  coverageThreshold: {
    global: {
      branches: 85,
      functions: 85,
      lines: 85,
      statements: 85,
    },
  },
  verbose: true,
  testTimeout: 10000,
  clearMocks: true,
  moduleDirectories: ['node_modules', 'server'],
  moduleFileExtensions: ['ts', 'js', 'json'],
};
