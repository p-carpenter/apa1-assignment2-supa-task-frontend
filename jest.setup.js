import "@testing-library/jest-dom";
import "jest-localstorage-mock";
import { server } from "./app/utils/testing/test-utils";
// Import node-fetch properly
import fetch, { Response, Request, Headers } from "node-fetch";

// Set up global fetch for Node environment
global.fetch = fetch;
global.Headers = Headers;
global.Request = Request;
global.Response = Response;

// Set up environment variables for tests
process.env.SUPABASE_URL = "https://test-supabase-url.com";
process.env.SUPABASE_ANON_KEY = "test-anon-key";

// Start MSW server before all tests
beforeAll(() => {
  console.log("Starting MSW server");
  server.listen({ onUnhandledRequest: "warn" });
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
