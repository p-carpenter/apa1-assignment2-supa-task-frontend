import { server } from "../../app/utils/testing/test-utils";
import { http, HttpResponse } from "msw";
import { GET } from "@/app/api/auth/user/route";

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

describe("auth/user API route", () => {
  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();
    mockCookieStore.get.mockReset();

    // Setup default handlers
    server.use(
      http.get(
        "https://test-supabase-url.com/functions/v1/authentication/user",
        () => {
          return HttpResponse.json({
            user: { id: "123", email: "test@example.com" },
            session: { token: "abc" },
          });
        }
      )
    );
  });

  it("successfully retrieves the current user", async () => {
    // Mock tokens in cookies
    mockCookieStore.get
      .mockImplementationOnce(() => ({ value: "test-access-token" }))
      .mockImplementationOnce(() => ({ value: "test-refresh-token" }));

    const response = await GET();
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data).toEqual({
      user: { id: "123", email: "test@example.com" },
      session: { token: "abc" },
    });
    expect(mockCookieStore.get).toHaveBeenCalledWith("sb-access-token");
    expect(mockCookieStore.get).toHaveBeenCalledWith("sb-refresh-token");
  });

  it("returns null user when not authenticated", async () => {
    // Mock missing tokens in cookies
    mockCookieStore.get
      .mockImplementationOnce(() => undefined)
      .mockImplementationOnce(() => undefined);

    const response = await GET();
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data).toEqual({ user: null, session: null });
  });

  it("returns null user when token is invalid", async () => {
    // Mock tokens in cookies
    mockCookieStore.get
      .mockImplementationOnce(() => ({ value: "invalid-access-token" }))
      .mockImplementationOnce(() => ({ value: "invalid-refresh-token" }));

    // Set up an error response
    server.use(
      http.get(
        "https://test-supabase-url.com/functions/v1/authentication/user",
        () => {
          return new HttpResponse(null, { status: 401 });
        }
      )
    );

    const response = await GET();
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data).toEqual({ user: null, session: null });
  });

  it("handles API errors", async () => {
    // Mock tokens in cookies
    mockCookieStore.get
      .mockImplementationOnce(() => ({ value: "test-access-token" }))
      .mockImplementationOnce(() => ({ value: "test-refresh-token" }));

    // Set up an error response
    server.use(
      http.get(
        "https://test-supabase-url.com/functions/v1/authentication/user",
        () => {
          return new HttpResponse(JSON.stringify({ error: "Server error" }), {
            status: 500,
          });
        }
      )
    );

    const response = await GET();
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data).toEqual({ error: "Server error" });
  });

  it("handles network errors", async () => {
    // Mock tokens in cookies
    mockCookieStore.get
      .mockImplementationOnce(() => ({ value: "test-access-token" }))
      .mockImplementationOnce(() => ({ value: "test-refresh-token" }));

    // Update expected data to match what the route actually returns
    const expectedData = { error: "Internal server error" };

    // Set up network error using MSW
    server.use(
      http.get(
        "https://test-supabase-url.com/functions/v1/authentication/user",
        () => {
          return HttpResponse.error();
        }
      )
    );

    const response = await GET();
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data).toEqual(expectedData);
  });
});
