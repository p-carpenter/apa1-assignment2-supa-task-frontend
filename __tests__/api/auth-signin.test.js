import { server } from "../../app/utils/testing/test-utils";
import { http, HttpResponse } from "msw";
import { POST } from "@/app/api/auth/signin/route";
import * as clientApi from "@/app/utils/api/clientApi";
import { ERROR_TYPES, ERROR_MESSAGES } from "@/app/utils/errors/errorTypes";
import { processApiError } from "@/app/utils/errors/errorService";
import { AUTH_CONFIG, CORS_HEADERS } from "@/app/utils/auth/config";
import { headers } from "next/headers";

// Mock the dependencies
jest.mock("@/app/utils/api/clientApi", () => ({
  fetchFromSupabase: jest.fn(),
}));

jest.mock("@/app/utils/errors/errorService", () => ({
  processApiError: jest.fn((error) => ({
    type: error.type || ERROR_TYPES.UNKNOWN_ERROR,
    message: error.message || ERROR_MESSAGES[ERROR_TYPES.UNKNOWN_ERROR],
    details: error.details || null,
    status: error.status || 500,
    originalError: error,
    isProcessed: true,
  })),
}));

const mockCookieStore = {
  cookies: {},
  headers: [],
  get: jest.fn((name) => {
    return mockCookieStore.cookies[name] ? { value: mockCookieStore.cookies[name] } : undefined;
  }),
  set: jest.fn((name, value, options) => {
    mockCookieStore.cookies[name] = value;

    const optionsString = options
      ? Object.entries(options)
          .filter(([_, val]) => val !== undefined)
          .map(([key, val]) => {
            // Convert camelCase to Capitalized-Hyphen format for headers
            const headerKey = key.replace(/([A-Z])/g, "-$1").replace(/^-/, "");
            const capitalizedKey = headerKey
              .split("-")
              .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
              .join("-");

            if (val === true) return capitalizedKey;
            return `${capitalizedKey}=${val}`;
          })
          .join("; ")
      : "";

    mockCookieStore.headers.push(`${name}=${value}; ${optionsString}`);

    return { name, value, ...options };
  }),
  getSetCookieHeaders: () => mockCookieStore.headers,
};

jest.mock("next/headers", () => ({
  cookies: jest.fn(() => mockCookieStore),
}));

describe("auth/signin API route", () => {
  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();

    // Clear cookies before each test
    document.cookie.split(";").forEach((cookie) => {
      const [name] = cookie.trim().split("=");
      document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`;
    });

    // Mock Date.now for consistent timestamps
    jest
      .spyOn(Date.prototype, "toISOString")
      .mockReturnValue("2023-01-01T00:00:00.000Z");
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("successfully signs in a user", async () => {
    // Mock successful fetchFromSupabase response
    clientApi.fetchFromSupabase.mockResolvedValueOnce({
      user: { id: "123", email: "test@example.com" },
      session: {
        access_token: "test-access-token",
        refresh_token: "test-refresh-token",
        expires_at: 1672531200, // example timestamp
      },
    });

    const mockRequest = {
      json: () =>
        Promise.resolve({
          email: "test@example.com",
          password: "password123",
        }),
    };

    // Reset the cookie store before test
    mockCookieStore.cookies = {};
    mockCookieStore.headers = [];

    const response = await POST(mockRequest);
    expect(response instanceof Response).toBe(true);

    const data = await response.json();

    expect(response.status).toBe(200);

    // Check that cookies were set with the correct values and options
    expect(mockCookieStore.set).toHaveBeenCalledWith(
      "sb-access-token",
      "test-access-token",
      expect.objectContaining({
        httpOnly: true,
        maxAge: AUTH_CONFIG.tokenExpiration.access,
        path: "/",
        sameSite: "lax",
      })
    );

    expect(mockCookieStore.set).toHaveBeenCalledWith(
      "sb-refresh-token",
      "test-refresh-token",
      expect.objectContaining({
        httpOnly: true,
        maxAge: AUTH_CONFIG.tokenExpiration.refresh,
        path: "/",
        sameSite: "lax",
      })
    );

    expect(data).toEqual({
      user: { id: "123", email: "test@example.com" },
      session: { expires_at: 1672531200 },
      timestamp: "2023-01-01T00:00:00.000Z",
    });

    // Verify fetchFromSupabase was called with the right arguments
    expect(clientApi.fetchFromSupabase).toHaveBeenCalledWith(
      "authentication/signin",
      "POST",
      {
        email: "test@example.com",
        password: "password123",
      }
    );
  });

  it("returns error when authentication fails", async () => {
    // Mock error from fetchFromSupabase
    const mockError = new Error("Invalid login credentials");
    mockError.status = 401;
    mockError.data = { error: "Invalid login credentials" };

    clientApi.fetchFromSupabase.mockRejectedValueOnce(mockError);

    // Mock processApiError to return a standardized error
    processApiError.mockReturnValueOnce({
      type: ERROR_TYPES.INVALID_CREDENTIALS,
      message: ERROR_MESSAGES[ERROR_TYPES.INVALID_CREDENTIALS],
      details: "Invalid login credentials",
      status: 401,
      originalError: mockError,
      isProcessed: true,
    });

    const mockRequest = {
      json: () =>
        Promise.resolve({
          email: "test@example.com",
          password: "wrong-password",
        }),
    };

    const response = await POST(mockRequest);
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data).toEqual({
      type: ERROR_TYPES.INVALID_CREDENTIALS,
      message: ERROR_MESSAGES[ERROR_TYPES.INVALID_CREDENTIALS],
      details: "Invalid login credentials",
      status: 401,
      timestamp: "2023-01-01T00:00:00.000Z",
      isProcessed: true,
      originalError: {
        data: { error: "Invalid login credentials" },
        status: 401,
      },
    });

    // Check CORS headers are present
    expect(response.headers.get("Access-Control-Allow-Origin")).toBe(
      CORS_HEADERS["Access-Control-Allow-Origin"]
    );
  });

  it("handles JSON parsing errors", async () => {
    const mockRequest = {
      json: () => Promise.reject(new Error("JSON parse error")),
    };

    const response = await POST(mockRequest);
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data).toHaveProperty("type", ERROR_TYPES.UNKNOWN_ERROR);
    expect(data).toHaveProperty("timestamp", "2023-01-01T00:00:00.000Z");
  });

  it("handles network errors", async () => {
    // Mock network error
    const networkError = new Error("Network error");
    networkError.name = "TypeError";
    networkError.message = "Failed to fetch";

    clientApi.fetchFromSupabase.mockRejectedValueOnce(networkError);

    processApiError.mockReturnValueOnce({
      type: ERROR_TYPES.NETWORK_ERROR,
      message: ERROR_MESSAGES[ERROR_TYPES.NETWORK_ERROR],
      status: 500,
      originalError: networkError,
      isProcessed: true,
    });

    const mockRequest = {
      json: () =>
        Promise.resolve({
          email: "test@example.com",
          password: "password123",
        }),
    };

    const response = await POST(mockRequest);
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data).toHaveProperty("type", ERROR_TYPES.NETWORK_ERROR);
    expect(data).toHaveProperty("timestamp", "2023-01-01T00:00:00.000Z");
  });

  it("handles successful authentication but no session", async () => {
    // Mock successful fetchFromSupabase response but without session
    clientApi.fetchFromSupabase.mockResolvedValueOnce({
      user: { id: "123", email: "test@example.com" },
      // No session data
    });

    const mockRequest = {
      json: () =>
        Promise.resolve({
          email: "test@example.com",
          password: "password123",
        }),
    };

    const response = await POST(mockRequest);
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data).toHaveProperty("timestamp", "2023-01-01T00:00:00.000Z");
  });
});
