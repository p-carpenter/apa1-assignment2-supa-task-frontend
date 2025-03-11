import "@testing-library/jest-dom";
import "jest-localstorage-mock";
import { server } from "./__tests__/test-utils";
import { Response, Request, Headers } from "node-fetch";

// Make Response, Request, and Headers globally available
global.Response = Response;
global.Request = Request;
global.Headers = Headers;

// Set up environment variables for tests
process.env.SUPABASE_URL = "https://test-supabase-url.com";
process.env.SUPABASE_ANON_KEY = "test-anon-key";

// Start MSW server before all tests
beforeAll(() => {
  console.log("Starting MSW server");
  server.listen({ onUnhandledRequest: 'warn' });
});

// Reset handlers after each test for isolation
afterEach(() => {
  console.log("Resetting MSW handlers");
  server.resetHandlers();
  localStorage.clear();
  jest.clearAllMocks();
});

// Clean up after all tests
afterAll(() => {
  console.log("Closing MSW server");
  server.close();
});

// Mock window.matchMedia which is not implemented in JSDOM
Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: jest.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

// Mock ResizeObserver which is not implemented in JSDOM
global.ResizeObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}));
