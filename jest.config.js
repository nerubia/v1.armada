module.exports = {
  clearMocks: true,
  coverageDirectory: 'coverage',
  moduleFileExtensions: ['ts'],
  coveragePathIgnorePatterns: ['/.serverless/'],
  preset: 'ts-jest',
  testEnvironment: 'node',
  testPathIgnorePatterns: ['/node_modules/', '/.serverless/'],
  verbose: true,
}
