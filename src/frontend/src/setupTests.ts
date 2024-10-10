// jest-dom adds custom jest matchers for asserting on DOM nodes.
// allows you to do things like:
// expect(element).toHaveTextContent(/react/i)
// learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom';

// Requirement addressed: Testing Setup
// Location: Technical Requirements/Testing
// Description: Configure the testing environment for the React frontend application

// Note: This file is automatically included by Create React App in all test files.
// It's used to set up the testing environment and add custom matchers or global configurations.
// Additional setup for specific testing requirements can be added to this file.

// If you need to add custom type definitions for testing, you can do so in the react-app-env.d.ts file.
// The react-app-env.d.ts file already includes type definitions from react-scripts (version ^5.0.1).

// Import additional testing utilities
import '@testing-library/jest-dom/extend-expect';
import { configure } from '@testing-library/react';

// Configure testing-library
configure({ testIdAttribute: 'data-testid' });

// Set up global mocks
jest.mock('src/utils/api', () => ({
  // Add mock implementations for API functions here
}));

// Set up global variables
global.ENVIRONMENT = process.env.NODE_ENV || 'test';

// Add custom matchers
expect.extend({
  toBeWithinRange(received: number, floor: number, ceiling: number) {
    const pass = received >= floor && received <= ceiling;
    if (pass) {
      return {
        message: () => `expected ${received} not to be within range ${floor} - ${ceiling}`,
        pass: true,
      };
    } else {
      return {
        message: () => `expected ${received} to be within range ${floor} - ${ceiling}`,
        pass: false,
      };
    }
  },
});

// Global setup
beforeAll(() => {
  // Perform any global setup before all tests
  console.log('Starting test suite');
});

// Global teardown
afterAll(() => {
  // Perform any global teardown after all tests
  console.log('Finished test suite');
});

// Reset mocks after each test
afterEach(() => {
  jest.resetAllMocks();
});