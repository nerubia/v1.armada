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
      branches: 92,
      functions: 97,
      lines: 98.5,
      statements: 98.5,
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
