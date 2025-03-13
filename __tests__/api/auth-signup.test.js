import { server } from "../test-utils";
import { http, HttpResponse } from "msw";
import { POST } from "@/app/api/auth/signup/route";

process.env.SUPABASE_URL = "https://test-supabase-url.com";
process.env.SUPABASE_ANON_KEY = "test-anon-key";

describe("auth/signup API route", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("successfully signs up a new user", async () => {
    server.use(
      http.post(
        "https://test-supabase-url.com/functions/v1/authentication/signup",
        () => {
          return HttpResponse.json({
            user: { id: "456", email: "new@example.com" },
            session: {
              access_token: "new-access-token",
              refresh_token: "new-refresh-token",
            },
          });
        }
      )
    );

    const mockRequest = {
      json: () =>
        Promise.resolve({
          email: "new@example.com",
          password: "password123",
          displayName: "New User",
        }),
    };

    const response = await POST(mockRequest);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data).toEqual({
      user: { id: "456", email: "new@example.com" },
      session: {
        access_token: "new-access-token",
        refresh_token: "new-refresh-token",
      },
    });
  });

  it("returns error when email is already in use", async () => {
    server.use(
      http.post(
        "https://test-supabase-url.com/functions/v1/authentication/signup",
        () => {
          return new HttpResponse(
            JSON.stringify({ error: "Email already in use" }),
            { status: 400 }
          );
        }
      )
    );

    const mockRequest = {
      json: () =>
        Promise.resolve({
          email: "existing@example.com",
          password: "password123",
          displayName: "Existing User",
        }),
    };

    const response = await POST(mockRequest);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data).toEqual({ error: "Email already in use" });
  });

  it("returns error when password is too short", async () => {
    // Set up an error response
    server.use(
      http.post(
        "https://test-supabase-url.com/functions/v1/authentication/signup",
        () => {
          return new HttpResponse(
            JSON.stringify({ error: "Password must be at least 6 characters" }),
            { status: 400 }
          );
        }
      )
    );

    const mockRequest = {
      json: () =>
        Promise.resolve({
          email: "new@example.com",
          password: "short",
          displayName: "New User",
        }),
    };

    const response = await POST(mockRequest);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data).toEqual({ error: "Password must be at least 6 characters" });
  });

  it("handles JSON parsing errors", async () => {
    const mockRequest = {
      json: () => Promise.reject(new Error("JSON parse error")),
    };

    const response = await POST(mockRequest);
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data).toEqual({ error: "Internal server error" });
  });

  it("handles network errors", async () => {
    // Set up network error
    server.use(
      http.post(
        "https://test-supabase-url.com/functions/v1/authentication/signup",
        () => {
          return HttpResponse.error();
        }
      )
    );

    const mockRequest = {
      json: () =>
        Promise.resolve({
          email: "new@example.com",
          password: "password123",
          displayName: "New User",
        }),
    };

    const response = await POST(mockRequest);
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data).toEqual({ error: "Internal server error" });
  });
});
