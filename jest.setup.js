import '@testing-library/jest-dom';
import { setupServer } from 'msw/node';
import { handlers } from './__tests__/__mocks__/handlers';

const server = setupServer(...handlers);

// Start the server before all tests
beforeAll(() => server.listen());

// Reset handlers after each test
afterEach(() => server.resetHandlers());

// Clean up after all tests
afterAll(() => server.close());