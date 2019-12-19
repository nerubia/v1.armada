module.exports = {
  clearMocks: true,
  collectCoverage: true,
  coverageDirectory: '../coverage',
  moduleFileExtensions: ['js', 'json', 'ts'],
  coveragePathIgnorePatterns: [
    '/.serverless/',
    'config.ts',
    'mocks.ts',
    '/template/',
  ],
  coverageThreshold: {
    global: {
      branches: 96.88,
      functions: 99,
      lines: 99,
      statements: 99,
    },
  },
  moduleNameMapper: {
    '^services/(.*)$': '<rootDir>/services/$1',
  },
  preset: 'ts-jest',
  rootDir: './src/',
  testEnvironment: 'node',
  testMatch: [
    '<rootDir>/services/**/*.test.ts',
    '<rootDir>/gateway/**/*.test.ts',
  ],
  testPathIgnorePatterns: ['/node_modules/', '/.serverless/', '/template/'],
  verbose: true,
}
