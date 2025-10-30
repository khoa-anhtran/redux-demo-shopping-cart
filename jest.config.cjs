/** @type {import('jest').Config} */
module.exports = {
  testEnvironment: 'jest-environment-jsdom',
  preset: 'ts-jest',
  transform: {
    '^.+\\.(ts|tsx)$': 'ts-jest',
    // if you enabled Babel for ESM deps earlier:
    '^.+\\.(mjs|cjs|js)$': 'babel-jest',
  },
  transformIgnorePatterns: [
    '/node_modules/(?!(msw|@mswjs|until-async)/)',
  ],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '\\.(css|scss|sass|less)$': 'identity-obj-proxy',
  },
  setupFilesAfterEnv: ['<rootDir>/src/setupTests.ts'],
}
