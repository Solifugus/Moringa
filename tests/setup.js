/**
 * Jest test setup file
 * Common test utilities and configurations
 */

// Increase timeout for timing-based tests
jest.setTimeout(10000);

// Global test utilities
global.sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Mock console.log during tests to reduce noise
const originalConsoleLog = console.log;
global.mockConsoleLog = () => {
    console.log = jest.fn();
};

global.restoreConsoleLog = () => {
    console.log = originalConsoleLog;
};

// Setup before each test
beforeEach(() => {
    // Clear any existing timeouts
    jest.clearAllTimers();
});

// Cleanup after each test
afterEach(() => {
    // Restore console.log if it was mocked
    console.log = originalConsoleLog;
});