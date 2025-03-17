import { server } from "../../app/utils/testing/test-utils";
import { http, HttpResponse } from "msw";
import { GET, POST } from "@/app/api/auth/protected/route";

// Mock the process.env
process.env.SUPABASE_URL = "https://test-supabase-url.com";
process.env.SUPABASE_ANON_KEY = "test-anon-key";

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

      // Set up MSW handler for this test
      server.use(
        http.get(
          "https://test-supabase-url.com/functions/v1/validate-auth",
          ({ cookies }) => {
            // Check cookies directly using MSW's cookies API
            if (
              cookies["sb-access-token"] === "test-access-token" &&
              cookies["sb-refresh-token"] === "test-refresh-token"
            ) {
              return HttpResponse.json({
                data: "This is protected data",
                userId: "123",
              });
            }
            return new HttpResponse(
              JSON.stringify({ error: "Invalid auth cookies" }),
              { status: 401 }
            );
          }
        )
      );

      const response = await GET();
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toEqual({
        data: "This is protected data",
        userId: "123",
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
      expect(data).toEqual({ error: "Unauthorized" });
    });

    it("handles API errors", async () => {
      // Mock tokens in cookies
      mockCookieStore.get
        .mockImplementationOnce(() => ({ value: "test-access-token" }))
        .mockImplementationOnce(() => ({ value: "test-refresh-token" }));

      // Set up an error response
      server.use(
        http.get(
          "https://test-supabase-url.com/functions/v1/validate-auth",
          () => {
            return new HttpResponse(
              JSON.stringify({ error: "Session expired" }),
              { status: 401 }
            );
          }
        )
      );

      const response = await GET();
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data).toEqual({ error: "Session expired" });
    });

    it("handles network errors", async () => {
      // Mock tokens in cookies
      mockCookieStore.get
        .mockImplementationOnce(() => ({ value: "test-access-token" }))
        .mockImplementationOnce(() => ({ value: "test-refresh-token" }));

      // Set up network error
      server.use(
        http.get(
          "https://test-supabase-url.com/functions/v1/validate-auth",
          () => {
            return HttpResponse.error();
          }
        )
      );

      const response = await GET();
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data).toEqual({ error: "Failed to fetch" });
    });
  });

  describe("POST", () => {
    it("successfully posts data to protected endpoint when authenticated", async () => {
      // Mock tokens in cookies
      mockCookieStore.get
        .mockImplementationOnce(() => ({ value: "test-access-token" }))
        .mockImplementationOnce(() => ({ value: "test-refresh-token" }));

      // Set up MSW handler for this test
      server.use(
        http.post(
          "https://test-supabase-url.com/functions/v1/validate-auth",
          async ({ cookies, request }) => {
            // Check cookies directly using MSW's cookies API
            if (
              cookies["sb-access-token"] === "test-access-token" &&
              cookies["sb-refresh-token"] === "test-refresh-token"
            ) {
              const body = await request.json();

              return HttpResponse.json({
                success: true,
                message: "Data saved successfully",
                received: body,
              });
            }
            return new HttpResponse(
              JSON.stringify({ error: "Invalid auth cookies" }),
              { status: 401 }
            );
          }
        )
      );

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

      expect(response.status).toBe(200);
      expect(data).toEqual({
        success: true,
        message: "Data saved successfully",
        received: expect.objectContaining({
          itemId: "123",
          action: "update",
        }),
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
      expect(data).toEqual({ error: "Unauthorized" });
    });

    it("handles API errors", async () => {
      // Mock tokens in cookies
      mockCookieStore.get
        .mockImplementationOnce(() => ({ value: "test-access-token" }))
        .mockImplementationOnce(() => ({ value: "test-refresh-token" }));

      // Set up an error response
      server.use(
        http.post(
          "https://test-supabase-url.com/functions/v1/validate-auth",
          () => {
            return new HttpResponse(
              JSON.stringify({ error: "Invalid data format" }),
              { status: 400 }
            );
          }
        )
      );

      const mockRequest = {
        json: () =>
          Promise.resolve({
            invalidFormat: true,
          }),
      };

      const response = await POST(mockRequest);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data).toEqual({ error: "Invalid data format" });
    });

    it("handles JSON parsing errors", async () => {
      // Mock tokens in cookies
      mockCookieStore.get
        .mockImplementationOnce(() => ({ value: "test-access-token" }))
        .mockImplementationOnce(() => ({ value: "test-refresh-token" }));

      const mockRequest = {
        json: () => Promise.reject(new Error("JSON parse error")),
      };

      const response = await POST(mockRequest);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data).toEqual({ error: "Failed to process request" });
    });
  });
});
