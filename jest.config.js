module.exports = {
  // Test environment
  testEnvironment: 'node',

  // Test file patterns
  testMatch: [
    '**/tests/**/*.test.js',
    '**/__tests__/**/*.test.js'
  ],

  // Coverage settings
  collectCoverage: false,
  collectCoverageFrom: [
    'moringa.js',
    '!node_modules/**',
    '!tests/**',
    '!coverage/**'
  ],

  // Timeout settings
  testTimeout: 10000, // 10 seconds for timing tests

  // Verbose output
  verbose: true,

  // Setup files
  setupFilesAfterEnv: ['<rootDir>/tests/setup.js']
};