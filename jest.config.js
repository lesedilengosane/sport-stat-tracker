const nextJest = require('next/jest')

const createJestConfig = nextJest({
  dir: './',
})

const customJestConfig = {
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
  testEnvironment: 'jsdom',
  collectCoverageFrom: [
    'src/**/*.{jsx,tsx}',

    // exclusions
    '!src/**/*.d.ts',
    '!src/**/*.stories.{js,jsx,tsx}',
    '!src/**/*.test.{js,jsx,tsx}',
    '!src/**/__tests__/**',
    '!src/app/globals.css',

    // Ignore untested components
    '!src/components/BookedGameButton.tsx',
    '!src/components/Booked_Games.tsx',
    '!src/components/UserCard.tsx',
    '!src/components/basketball-stat-tracker.tsx',
    '!src/components/basketball-timeline.tsx',
    '!src/components/game-card.tsx',
    '!src/components/games-grid.tsx',
    '!src/components/historicaldata.tsx',
    '!src/components/last5games.tsx',
    '!src/components/line-up-page.tsx',
    '!src/components/Line-up-table/**',
    '!src/components/TeamStats/**',
    '!src/components/coachComponents/**',
    '!src/components/header/**',

    // Exclude only untested ui files, keep NavBar + TabBar
    '!src/components/ui/action-buttons.tsx',
    '!src/components/ui/badge.tsx',
    '!src/components/ui/button.tsx',
    '!src/components/ui/card.tsx',
    '!src/components/ui/dialog.tsx',
    '!src/components/ui/game-history.tsx',
    '!src/components/ui/input.tsx',
    '!src/components/ui/label.tsx',
    '!src/components/ui/player-stat-card.tsx',
    '!src/components/ui/select.tsx',
    '!src/components/ui/table.tsx',
    '!src/components/ui/tabs.tsx',
    '!src/components/ui/team-player-card.tsx',
  ],
  coverageReporters: ['text', 'lcov', 'html'],
  coverageDirectory: 'coverage',
  coverageThreshold: {
    global: {
      branches: 75,
      functions: 80,
      lines: 80,
      statements: 80,
    },
  },
}

module.exports = createJestConfig(customJestConfig)
