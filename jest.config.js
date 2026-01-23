module.exports = {
  testEnvironment: 'node',
  roots: ['<rootDir>/tests'],
  transform: {
    '^.+\\.ts$': 'ts-jest',
  },
  testMatch: [
    '**/*.test.{js,ts}',
  ],
  testPathIgnorePatterns: ['/node_modules/', '/client/'],
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
  forceExit: true,
  moduleDirectories: ['node_modules', 'server'],
  moduleFileExtensions: ['js', 'ts', 'json'],
};
