import { server } from "../test-utils";
import { http, HttpResponse } from "msw";
import { POST } from "@/app/api/auth/signout/route";

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

describe("auth/signout API route", () => {
  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();
    mockCookieStore.get.mockReset();
  });

  it("successfully signs out a user", async () => {
    // Mock tokens in cookies
    mockCookieStore.get
      .mockImplementationOnce(() => ({ value: "test-access-token" }))
      .mockImplementationOnce(() => ({ value: "test-refresh-token" }));

    // Set up MSW handler for this test
    server.use(
      http.post(
        "https://test-supabase-url.com/functions/v1/authentication/signout",
        () => {
          return new HttpResponse(JSON.stringify({ success: true }), {
            headers: {
              "Content-Type": "application/json",
              "Set-Cookie": [
                "sb-access-token=; HttpOnly; Path=/; Max-Age=0; SameSite=Lax",
                "sb-refresh-token=; HttpOnly; Path=/; Max-Age=0; SameSite=Lax",
              ],
            },
          });
        }
      )
    );

    const response = await POST({});
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data).toEqual({ success: true });

    // Verify cookies were set to be cleared
    expect(mockCookieStore.set).toHaveBeenCalledTimes(2);
    expect(mockCookieStore.set).toHaveBeenCalledWith(
      "sb-access-token",
      "",
      expect.objectContaining({
        maxAge: 0,
      })
    );
    expect(mockCookieStore.set).toHaveBeenCalledWith(
      "sb-refresh-token",
      "",
      expect.objectContaining({
        maxAge: 0,
      })
    );
  });

  it("returns error when session is not found", async () => {
    // Mock tokens in cookies
    mockCookieStore.get
      .mockImplementationOnce(() => ({ value: "invalid-access-token" }))
      .mockImplementationOnce(() => ({ value: "invalid-refresh-token" }));

    // Set up an error response
    server.use(
      http.post(
        "https://test-supabase-url.com/functions/v1/authentication/signout",
        () => {
          return new HttpResponse(
            JSON.stringify({ error: "Session not found" }),
            { status: 400 }
          );
        }
      )
    );

    const response = await POST({});
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data).toEqual({ error: "Session not found" });
    // No cookies should be cleared on error
    expect(mockCookieStore.set).not.toHaveBeenCalled();
  });

  it("handles network errors", async () => {
    // Mock tokens in cookies
    mockCookieStore.get
      .mockImplementationOnce(() => ({ value: "test-access-token" }))
      .mockImplementationOnce(() => ({ value: "test-refresh-token" }));

    // Set up network error
    server.use(
      http.post(
        "https://test-supabase-url.com/functions/v1/authentication/signout",
        () => {
          return HttpResponse.error();
        }
      )
    );

    const response = await POST({});
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data).toEqual({ error: "Internal server error" });
    // No cookies should be cleared on error
    expect(mockCookieStore.set).not.toHaveBeenCalled();
  });
});
