/**
 * Test Setup
 * Global test configuration and utilities
 */

// Extend Jest matchers
expect.extend({
    toBeWithinRange(received: number, floor: number, ceiling: number) {
        const pass = received >= floor && received <= ceiling;
        if (pass) {
            return {
                message: () =>
                    `expected ${received} not to be within range ${floor} - ${ceiling}`,
                pass: true,
            };
        } else {
            return {
                message: () =>
                    `expected ${received} to be within range ${floor} - ${ceiling}`,
                pass: false,
            };
        }
    },
});

// Mock environment variables
process.env.LOG_LEVEL = 'error'; // Suppress logs during tests
process.env.ENVIRONMENT = 'test';
process.env.ENABLE_REDIS = 'false';
process.env.ENABLE_METRICS = 'false';
process.env.ENABLE_DETAILED_LOGGING = 'false';

// Global test timeout
jest.setTimeout(10000);
