import { server } from "../../app/utils/testing/test-utils";
import { http, HttpResponse } from "msw";
import { GET, POST } from "@/app/api/auth/protected/route";

// Mock the process.env
process.env.SUPABASE_URL = "https://test-supabase-url.com";
process.env.SUPABASE_ANON_KEY = "test-anon-key";

// Mock the processApiError function
jest.mock("@/app/utils/errors/errorService", () => ({
  processApiError: jest.fn((error, options = {}) => {
    if (error.message === "Authentication required") {
      return { error: "Unauthorized", status: 401 };
    }
    if (error.status) {
      return { error: error.message || "API Error", status: error.status };
    }
    return { 
      error: options.defaultMessage || error.message || "Unknown error", 
      status: error.status || 500 
    };
  }),
}));

// Mock the fetchFromSupabase function
jest.mock("@/app/utils/api/clientApi", () => ({
  fetchFromSupabase: jest.fn(async (path, method, body, headers) => {
    // This will be mocked differently for each test
    if (path === "protected-data" && method === "GET") {
      if (headers.Cookie && headers.Cookie.includes("sb-access-token") && headers.Cookie.includes("sb-refresh-token")) {
        return "This is protected data";
      }
      throw new Error("Session expired");
    }
    
    if (path === "protected-data" && method === "POST") {
      if (headers.Cookie && headers.Cookie.includes("sb-access-token") && headers.Cookie.includes("sb-refresh-token")) {
        return {
          success: true,
          message: "Data saved successfully",
          received: body
        };
      }
      throw new Error("Session expired");
    }
    
    throw new Error("Unhandled request in mock");
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

describe("auth/protected API route", () => {
  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();
    mockCookieStore.get.mockReset();
  });

  describe("GET", () => {
    it("successfully retrieves protected data when authenticated", async () => {
      // Mock tokens in cookies
      mockCookieStore.get
        .mockImplementationOnce(() => ({ value: "test-access-token" }))
        .mockImplementationOnce(() => ({ value: "test-refresh-token" }));

      const response = await GET();
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toEqual({
        data: "This is protected data",
        timestamp: expect.any(String)
      });
      expect(mockCookieStore.get).toHaveBeenCalledWith("sb-access-token");
      expect(mockCookieStore.get).toHaveBeenCalledWith("sb-refresh-token");
    });

    it("returns 401 when not authenticated", async () => {
      // Mock missing tokens in cookies
      mockCookieStore.get
        .mockImplementationOnce(() => undefined)
        .mockImplementationOnce(() => undefined);

      const response = await GET();
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data).toEqual({ 
        error: "Unauthorized",
        status: 401,
        timestamp: expect.any(String)
      });
    });

    it("handles API errors", async () => {
      // Mock tokens in cookies
      mockCookieStore.get
        .mockImplementationOnce(() => ({ value: "test-access-token" }))
        .mockImplementationOnce(() => ({ value: "test-refresh-token" }));

      // Override the fetchFromSupabase mock for this test
      const { fetchFromSupabase } = require("@/app/utils/api/clientApi");
      fetchFromSupabase.mockImplementationOnce(() => {
        const error = new Error("Session expired");
        error.status = 401;
        throw error;
      });

      const response = await GET();
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data).toEqual({ 
        error: "Session expired",
        status: 401,
        timestamp: expect.any(String)
      });
    });

    it("handles network errors", async () => {
      // Mock tokens in cookies
      mockCookieStore.get
        .mockImplementationOnce(() => ({ value: "test-access-token" }))
        .mockImplementationOnce(() => ({ value: "test-refresh-token" }));

      // Override the fetchFromSupabase mock for this test
      const { fetchFromSupabase } = require("@/app/utils/api/clientApi");
      fetchFromSupabase.mockImplementationOnce(() => {
        const error = new Error("Failed to fetch");
        error.status = 500;
        throw error;
      });

      const response = await GET();
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data).toEqual({ 
        error: "Failed to fetch",
        status: 500,
        timestamp: expect.any(String)
      });
    });
  });

  describe("POST", () => {
    it("successfully posts data to protected endpoint when authenticated", async () => {
      // Mock tokens in cookies
      mockCookieStore.get
        .mockImplementationOnce(() => ({ value: "test-access-token" }))
        .mockImplementationOnce(() => ({ value: "test-refresh-token" }));

      const mockRequest = {
        json: () =>
          Promise.resolve({
            itemId: "123",
            action: "update",
            data: { name: "Updated Item" },
          }),
      };

      const response = await POST(mockRequest);
      const data = await response.json();

      expect(response.status).toBe(201); // Note: Implementation returns 201 for successful POST
      expect(data).toEqual({
        data: {
          success: true,
          message: "Data saved successfully",
          received: expect.objectContaining({
            itemId: "123",
            action: "update",
          }),
        },
        timestamp: expect.any(String)
      });
      expect(mockCookieStore.get).toHaveBeenCalledWith("sb-access-token");
      expect(mockCookieStore.get).toHaveBeenCalledWith("sb-refresh-token");
    });

    it("returns 401 when not authenticated", async () => {
      // Mock missing tokens in cookies
      mockCookieStore.get
        .mockImplementationOnce(() => undefined)
        .mockImplementationOnce(() => undefined);

      const mockRequest = {
        json: () =>
          Promise.resolve({
            itemId: "123",
            action: "update",
          }),
      };

      const response = await POST(mockRequest);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data).toEqual({ 
        error: "Unauthorized",
        status: 401,
        timestamp: expect.any(String)
      });
    });

    it("handles API errors", async () => {
      // Mock tokens in cookies
      mockCookieStore.get
        .mockImplementationOnce(() => ({ value: "test-access-token" }))
        .mockImplementationOnce(() => ({ value: "test-refresh-token" }));

      // Override the fetchFromSupabase mock for this test
      const { fetchFromSupabase } = require("@/app/utils/api/clientApi");
      fetchFromSupabase.mockImplementationOnce(() => {
        const error = new Error("Invalid data format");
        error.status = 400;
        throw error;
      });

      const mockRequest = {
        json: () =>
          Promise.resolve({
            invalidFormat: true,
          }),
      };

      const response = await POST(mockRequest);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data).toEqual({ 
        error: "Invalid data format",
        status: 400,
        timestamp: expect.any(String)
      });
    });

    it("handles JSON parsing errors", async () => {
      // Mock tokens in cookies
      mockCookieStore.get
        .mockImplementationOnce(() => ({ value: "test-access-token" }))
        .mockImplementationOnce(() => ({ value: "test-refresh-token" }));

      // Add mock for processApiError to handle this specific error
      const { processApiError } = require("@/app/utils/errors/errorService");
      processApiError.mockImplementationOnce(() => {
        return { error: "Failed to process request", status: 500 };
      });

      const mockRequest = {
        json: () => Promise.reject(new Error("JSON parse error")),
      };

      const response = await POST(mockRequest);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data).toEqual({ 
        error: "Failed to process request",
        status: 500,
        timestamp: expect.any(String)
      });
    });
  });
});