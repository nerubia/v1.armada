module.exports = {
  clearMocks: true,
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
      functions: 100,
      lines: 100,
      statements: 100,
    },
  },
  moduleNameMapper: {
    '^services/(.*)$': '<rootDir>/services/$1',
  },
  preset: 'ts-jest',
  rootDir: './src/',
  testEnvironment: 'node',
  testMatch: [
    '<rootDir>/gateway/**/*.test.ts',
    '<rootDir>/services/**/*.test.ts',
    '<rootDir>/utils/**/*.test.ts',
  ],
  testPathIgnorePatterns: ['/node_modules/', '/.serverless/', '/template/'],
  verbose: false,
}
