module.exports = {
  preset: 'ts-jest',
  collectCoverage: true,
  collectCoverageFrom: ['src/index.ts'],
  moduleDirectories: ['node_modules', '<rootDir>/src', '<rootDir>/test'],
  moduleNameMapper: {
    '@src/(.+)$': '<rootDir>/src/$1',
    '@test/(.+)$': '<rootDir>/test/$1',
  },
}
