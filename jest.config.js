module.exports = {
  testEnvironment: 'node',
  testMatch: ['**/__tests__/**/*.test.js', '**/tests/**/*.test.js'],
  collectCoverageFrom: [
    'server/**/*.js',
    '!server/**/index.js',
    '!**/node_modules/**',
  ],
  coverageDirectory: 'coverage',
  verbose: true,
  testTimeout: 10000,
  // Clear mocks between tests
  clearMocks: true,
  // Module paths
  moduleDirectories: ['node_modules', 'server'],
};
