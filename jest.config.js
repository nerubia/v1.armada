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
  preset: 'ts-jest',
  rootDir: './',
  testEnvironment: 'node',
  testMatch: [
    '<rootDir>/services/**/*.test.ts',
    '<rootDir>/gateway/**/*.test.ts',
  ],
  testPathIgnorePatterns: ['/node_modules/', '/.serverless/', '/template/'],
  verbose: true,
}
