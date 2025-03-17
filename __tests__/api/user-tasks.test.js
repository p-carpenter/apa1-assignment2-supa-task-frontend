import { server } from "../../app/utils/testing/test-utils";
import { http, HttpResponse } from "msw";
import { GET, POST } from "@/app/api/user-tasks/route";

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

describe("user-tasks API route", () => {
  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();
    mockCookieStore.get.mockReset();
  });

  describe("GET", () => {
    it("successfully fetches tasks when authenticated", async () => {
      // Mock tokens in cookies
      mockCookieStore.get
        .mockImplementationOnce(() => ({ value: "test-access-token" }))
        .mockImplementationOnce(() => ({ value: "test-refresh-token" }));

      // Set up MSW handler for this test
      server.use(
        http.get(
          "https://test-supabase-url.com/functions/v1/protected",
          ({ cookies }) => {
            // Check auth cookies using MSW's cookies API
            if (
              cookies["sb-access-token"] === "test-access-token" &&
              cookies["sb-refresh-token"] === "test-refresh-token"
            ) {
              return HttpResponse.json({
                tasks: [
                  { id: "1", title: "Task 1", completed: false },
                  { id: "2", title: "Task 2", completed: true },
                ],
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
        tasks: [
          { id: "1", title: "Task 1", completed: false },
          { id: "2", title: "Task 2", completed: true },
        ],
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
        http.get("https://test-supabase-url.com/functions/v1/protected", () => {
          return new HttpResponse(JSON.stringify({ error: "Server error" }), {
            status: 500,
          });
        })
      );

      const response = await GET();
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data).toEqual({ error: "Server error" });
    });

    it("handles fetch errors", async () => {
      // Mock tokens in cookies
      mockCookieStore.get
        .mockImplementationOnce(() => ({ value: "test-access-token" }))
        .mockImplementationOnce(() => ({ value: "test-refresh-token" }));

      // Set up network error
      server.use(
        http.get("https://test-supabase-url.com/functions/v1/protected", () => {
          return HttpResponse.error();
        })
      );

      const response = await GET();
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data).toEqual({
        error: "Failed to fetch tasks",
      });
    });
  });

  describe("POST", () => {
    it("successfully creates a task when authenticated", async () => {
      // Mock tokens in cookies
      mockCookieStore.get
        .mockImplementationOnce(() => ({ value: "test-access-token" }))
        .mockImplementationOnce(() => ({ value: "test-refresh-token" }));

      // Set up MSW handler for this test
      server.use(
        http.post(
          "https://test-supabase-url.com/functions/v1/protected",
          async ({ cookies, request }) => {
            // Check cookies directly using MSW's cookies API
            if (
              cookies["sb-access-token"] === "test-access-token" &&
              cookies["sb-refresh-token"] === "test-refresh-token"
            ) {
              const body = await request.json();

              return HttpResponse.json({
                success: true,
                task: {
                  id: "3",
                  title: body.title || "New Task",
                  completed: false,
                },
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
        json: () => Promise.resolve({ title: "New Task" }),
      };

      const response = await POST(mockRequest);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toEqual({
        success: true,
        task: { id: "3", title: "New Task", completed: false },
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
        json: () => Promise.resolve({ title: "New Task" }),
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
          "https://test-supabase-url.com/functions/v1/protected",
          () => {
            return new HttpResponse(JSON.stringify({ error: "Invalid data" }), {
              status: 400,
            });
          }
        )
      );

      const mockRequest = {
        json: () => Promise.resolve({ title: "" }), // Invalid title
      };

      const response = await POST(mockRequest);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data).toEqual({ error: "Invalid data" });
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
      expect(data).toEqual({ error: "Failed to create task" });
    });
  });
});
