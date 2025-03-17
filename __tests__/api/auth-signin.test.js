import { server } from "../../app/utils/testing/test-utils";
import { http, HttpResponse } from "msw";
import { POST } from "@/app/api/auth/signin/route";
import { NextResponse } from "next/server";

// Mock the process.env
process.env.SUPABASE_URL = "https://test-supabase-url.com";
process.env.SUPABASE_ANON_KEY = "test-anon-key";

// Mock the Next.js cookies module
jest.mock("next/headers", () => ({
  cookies: jest.fn(() => ({
    get: jest.fn((name) => {
      const value = document.cookie
        .split("; ")
        .find((row) => row.startsWith(`${name}=`))
        ?.split("=")[1];
      return value ? { value } : undefined;
    }),
    set: jest.fn((name, value, options) => {
      const optionsStr = options
        ? Object.entries(options)
            .filter(([_, val]) => val !== undefined)
            .map(([key, val]) => `${key}=${val}`)
            .join("; ")
        : "";
      document.cookie = `${name}=${value}${optionsStr ? `; ${optionsStr}` : ""}`;
    }),
  })),
}));

// Mock NextResponse.json to return a standard Response
jest.mock("next/server", () => {
  const originalModule = jest.requireActual("next/server");
  return {
    ...originalModule,
    NextResponse: {
      ...originalModule.NextResponse,
      json: jest.fn((body, init) => {
        return new Response(JSON.stringify(body), {
          ...init,
          headers: {
            ...init?.headers,
            "Content-Type": "application/json",
          },
        });
      }),
    },
  };
});

describe("auth/signin API route", () => {
  beforeEach(() => {
    // Clear cookies before each test
    document.cookie.split(";").forEach((cookie) => {
      const [name] = cookie.trim().split("=");
      document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`;
    });

    // Set up the default handler for the authentication endpoint
    server.use(
      http.post(
        "https://test-supabase-url.com/functions/v1/authentication/signin",
        async ({ request }) => {
          const body = await request.json();

          if (
            body.email === "test@example.com" &&
            body.password === "password123"
          ) {
            return HttpResponse.json(
              {
                user: { id: "123", email: "test@example.com" },
                session: {
                  access_token: "test-access-token",
                  refresh_token: "test-refresh-token",
                },
              },
              {
                headers: {
                  "Set-Cookie": [
                    "sb-access-token=test-access-token; HttpOnly; Path=/; Max-Age=3600; SameSite=Lax",
                    "sb-refresh-token=test-refresh-token; HttpOnly; Path=/; Max-Age=7776000; SameSite=Lax",
                  ],
                },
              }
            );
          }

          return HttpResponse.json(
            { error: "Invalid login credentials" },
            { status: 401 }
          );
        }
      )
    );
  });

  it("successfully signs in a user", async () => {
    const mockRequest = {
      json: () =>
        Promise.resolve({
          email: "test@example.com",
          password: "password123",
        }),
    };

    const response = await POST(mockRequest);
    expect(response instanceof Response).toBe(true);

    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data).toEqual({
      user: { id: "123", email: "test@example.com" },
      session: {
        access_token: "test-access-token",
        refresh_token: "test-refresh-token",
      },
    });
  });

  it("returns error when incorrect credentials provided", async () => {
    server.use(
      http.post(
        "https://test-supabase-url.com/functions/v1/authentication/signin",
        () => {
          return HttpResponse.json(
            { error: "Invalid login credentials" },
            { status: 401 }
          );
        }
      )
    );

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
    expect(data).toEqual({ error: "Invalid login credentials" });
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
    server.use(
      http.post(
        "https://test-supabase-url.com/functions/v1/authentication/signin",
        () => {
          return HttpResponse.error();
        }
      )
    );

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
    expect(data).toEqual({ error: "Internal server error" });
  });
});
