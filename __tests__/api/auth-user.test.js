import { server } from "../../app/utils/testing/test-utils";
import { http, HttpResponse } from "msw";
import { GET } from "@/app/api/auth/user/route";

// Mock the process.env
process.env.SUPABASE_URL = "https://test-supabase-url.com";
process.env.SUPABASE_ANON_KEY = "test-anon-key";

// Mock getServerSession function
jest.mock("@/app/utils/auth/server", () => ({
  getServerSession: jest.fn(async () => {
    // This will be mocked differently for each test case
    return { user: null, session: null };
  }),
}));

// Mock the processApiError function
jest.mock("@/app/utils/errors/errorService", () => ({
  processApiError: jest.fn((error, options = {}) => {
    if (error.message === "No active session found") {
      return {
        error: "Please sign in to continue.",
        type: "auth_required",
        status: 401,
      };
    }
    if (error.status === 401) {
      return {
        error: "Please sign in to continue.",
        type: "auth_required",
        status: 401,
      };
    }
    if (error.status === 500 || error.message === "Failed to fetch") {
      return {
        error: "Internal server error",
        type: "service_unavailable",
        status: 500,
      };
    }
    return {
      error: options.defaultMessage || error.message || "Unknown error",
      type: "unknown_error",
      status: error.status || 500,
    };
  }),
}));

// Mock the cookies
const mockCookieStore = {
  has: jest.fn(),
  get: jest.fn(),
  getAll: jest.fn(),
  set: jest.fn(),
};

// Mock Next.js cookies module
jest.mock("next/headers", () => ({
  cookies: jest.fn(() => mockCookieStore),
}));

describe("auth/user API route", () => {
  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();
    mockCookieStore.get.mockReset();
  });

  it("successfully retrieves the current user", async () => {
    // Mock tokens in cookies
    mockCookieStore.get
      .mockImplementationOnce(() => ({ value: "test-access-token" }))
      .mockImplementationOnce(() => ({ value: "test-refresh-token" }));

    // Mock successful session
    const { getServerSession } = require("@/app/utils/auth/server");
    getServerSession.mockImplementationOnce(async () => ({
      user: { id: "123", email: "test@example.com" },
      session: { token: "abc" },
    }));

    const response = await GET();
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data).toEqual({
      user: { id: "123", email: "test@example.com" },
      session: { token: "abc" },
      timestamp: expect.any(String),
    });
  });

  it("returns error when not authenticated", async () => {
    // Mock missing tokens in cookies
    mockCookieStore.get
      .mockImplementationOnce(() => undefined)
      .mockImplementationOnce(() => undefined);

    // Mock no session
    const { getServerSession } = require("@/app/utils/auth/server");
    getServerSession.mockImplementationOnce(async () => ({
      user: null,
      session: null,
    }));

    const response = await GET();
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data).toEqual({
      error: "Please sign in to continue.",
      type: "auth_required",
      status: 401,
      timestamp: expect.any(String),
    });
  });

  it("returns error when token is invalid", async () => {
    // Mock tokens in cookies
    mockCookieStore.get
      .mockImplementationOnce(() => ({ value: "invalid-access-token" }))
      .mockImplementationOnce(() => ({ value: "invalid-refresh-token" }));

    // Mock session error
    const { getServerSession } = require("@/app/utils/auth/server");
    getServerSession.mockImplementationOnce(async () => {
      const error = new Error("Session expired");
      error.status = 401;
      throw error;
    });

    const response = await GET();
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data).toEqual({
      error: "Please sign in to continue.",
      type: "auth_required",
      status: 401,
      timestamp: expect.any(String),
    });
  });

  it("handles API errors", async () => {
    // Mock tokens in cookies
    mockCookieStore.get
      .mockImplementationOnce(() => ({ value: "test-access-token" }))
      .mockImplementationOnce(() => ({ value: "test-refresh-token" }));

    // Mock server error
    const { getServerSession } = require("@/app/utils/auth/server");
    getServerSession.mockImplementationOnce(async () => {
      const error = new Error("Server error");
      error.status = 500;
      throw error;
    });

    const response = await GET();
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data).toEqual({
      error: "Internal server error",
      type: "service_unavailable",
      status: 500,
      timestamp: expect.any(String),
    });
  });

  it("handles network errors", async () => {
    // Mock tokens in cookies
    mockCookieStore.get
      .mockImplementationOnce(() => ({ value: "test-access-token" }))
      .mockImplementationOnce(() => ({ value: "test-refresh-token" }));

    // Mock network error
    const { getServerSession } = require("@/app/utils/auth/server");
    getServerSession.mockImplementationOnce(async () => {
      throw new Error("Failed to fetch");
    });

    const response = await GET();
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data).toEqual({
      error: "Internal server error",
      type: "service_unavailable",
      status: 500,
      timestamp: expect.any(String),
    });
  });
});
