const nextJest = require('next/jest')

const createJestConfig = nextJest({
  // Provide the path to your Next.js app to load next.config.js and .env files
  dir: './',
})

// Add any custom config to be passed to Jest
const customJestConfig = {
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
  testEnvironment: 'jsdom',
  collectCoverageFrom: [
    'src/**/*.{js,jsx,tsx}',   // removed plain .ts
    '!src/**/*.d.ts',
    '!src/**/*.stories.{js,jsx,tsx}',
    '!src/**/*.test.{js,jsx,tsx}',
    '!src/**/__tests__/**',
    '!src/app/globals.css',
  ],
  coverageReporters: [
    'text',
    'lcov',
    'html',
  ],
  coverageDirectory: 'coverage',
  coverageThreshold: {
    global: {
      branches: 3,
      functions: 3,
      lines: 3,
      statements: 3,
    },
  },
}

// createJestConfig is exported this way to ensure that next/jest can load the Next.js config which is async
module.exports = createJestConfig(customJestConfig)
