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
      branches: 92,
      functions: 97,
      lines: 98,
      statements: 98,
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
