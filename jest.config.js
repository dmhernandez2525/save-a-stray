module.exports = {
  testEnvironment: 'node',
  transform: {
    '^.+\\.ts$': 'ts-jest',
  },
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
  verbose: true,
  testTimeout: 10000,
  clearMocks: true,
  moduleDirectories: ['node_modules', 'server'],
  moduleFileExtensions: ['js', 'ts', 'json'],
};
