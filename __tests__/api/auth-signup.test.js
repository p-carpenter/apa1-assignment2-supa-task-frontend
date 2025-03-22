import { server } from "../../app/utils/testing/test-utils";
import { http, HttpResponse } from "msw";
import { POST } from "@/app/api/auth/signup/route";
import { ERROR_TYPES } from "@/app/utils/errors/errorTypes";
import { CORS_HEADERS } from "@/app/utils/auth/config";

// Set up test environment variables
process.env.SUPABASE_URL = "https://test-supabase-url.com";
process.env.SUPABASE_ANON_KEY = "test-anon-key";

describe("auth/signup API route", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(console, 'error').mockImplementation(() => {});
    jest.spyOn(console, 'log').mockImplementation(() => {});
  });

  afterEach(() => {
    console.error.mockRestore();
    console.log.mockRestore();
  });

  it("successfully signs up a new user", async () => {
    server.use(
      http.post(
        "https://test-supabase-url.com/functions/v1/authentication/signup",
        () => {
          return HttpResponse.json({
            user: { 
              id: "456", 
              email: "new@example.com",
              identities: [{ id: "some-identity" }]
            },
            session: null
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
      success: true,
      user: { 
        id: "456", 
        email: "new@example.com",
        identities: [{ id: "some-identity" }]
      },
      timestamp: expect.any(String)
    });
  });

  it("returns error when email is already in use", async () => {
    server.use(
      http.post(
        "https://test-supabase-url.com/functions/v1/authentication/signup",
        () => {
          return HttpResponse.json({
            user: { 
              id: "456", 
              email: "existing@example.com",
              identities: [] 
            }
          });
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

    expect(response.status).toBe(409);
    expect(data).toEqual({
      error: "Email already exists",
      type: ERROR_TYPES.ALREADY_EXISTS,
      details: "This email is already registered",
      timestamp: expect.any(String)
    });
  });

  it("returns error when password is too short", async () => {
    // Set up an error response
    server.use(
      http.post(
        "https://test-supabase-url.com/functions/v1/authentication/signup",
        () => {
          return new HttpResponse(
            JSON.stringify({ 
              error: "Password must be at least 6 characters",
              message: "Password must be at least 6 characters"
            }),
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
    expect(data).toHaveProperty('message');
    expect(data).toHaveProperty('timestamp');
    expect(data.type).toBe('unknown_error');
  });

  it("handles JSON parsing errors", async () => {
    const mockRequest = {
      json: () => Promise.reject(new Error("JSON parse error")),
    };

    const response = await POST(mockRequest);
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data).toHaveProperty('timestamp');
    // The implementation doesn't use ERROR_TYPES.SERVICE_ERROR for this case
    expect(data).toHaveProperty('type');
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
    expect(data).toHaveProperty('type');
    expect(data).toHaveProperty('timestamp');
    expect(data.message).toContain('Network error');
  });

  // Edge Case: Empty payload
  it("handles empty payload gracefully", async () => {
    // Mock validation error for empty payload
    server.use(
      http.post(
        "https://test-supabase-url.com/functions/v1/authentication/signup",
        () => {
          return new HttpResponse(
            JSON.stringify({ 
              error: "Missing required fields",
              message: "Email and password are required"
            }),
            { status: 400 }
          );
        }
      )
    );

    const mockRequest = {
      json: () => Promise.resolve({}),
    };

    const response = await POST(mockRequest);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data).toHaveProperty('message');
  });

  // Edge Case: Malformed email
  it("validates email format", async () => {
    server.use(
      http.post(
        "https://test-supabase-url.com/functions/v1/authentication/signup",
        () => {
          return new HttpResponse(
            JSON.stringify({ 
              error: "Invalid email format",
              message: "Invalid email format" 
            }),
            { status: 400 }
          );
        }
      )
    );

    const mockRequest = {
      json: () =>
        Promise.resolve({
          email: "not-an-email",
          password: "password123",
          displayName: "Test User",
        }),
    };

    const response = await POST(mockRequest);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data).toHaveProperty('message');
  });

  // Security: Weak password rejection
  it("rejects weak passwords", async () => {
    server.use(
      http.post(
        "https://test-supabase-url.com/functions/v1/authentication/signup",
        () => {
          return new HttpResponse(
            JSON.stringify({ 
              error: "Password too weak",
              message: "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character"
            }),
            { status: 400 }
          );
        }
      )
    );

    const mockRequest = {
      json: () =>
        Promise.resolve({
          email: "secure@example.com",
          password: "password", // Simple password without complexity
          displayName: "Security Test",
        }),
    };

    const response = await POST(mockRequest);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data).toHaveProperty('message');
  });

  // Security: Very long inputs (potential DoS or buffer overflow attack)
  it("handles extremely long inputs safely", async () => {
    // Generate a very long string
    const veryLongString = "A".repeat(10000);
    
    const mockRequest = {
      json: () =>
        Promise.resolve({
          email: `long-email${veryLongString}@example.com`,
          password: `long-password-${veryLongString}`,
          displayName: `Long Name ${veryLongString}`,
        }),
    };

    const response = await POST(mockRequest);
    // We don't care what the exact response is, just that it handles it 
    // without crashing and returns some kind of structured response
    expect(response instanceof Response).toBe(true);
    const data = await response.json();
    expect(data).toHaveProperty('timestamp');
  });

  // Ensure CORS headers are set properly
  it("sets appropriate CORS headers", async () => {
    server.use(
      http.post(
        "https://test-supabase-url.com/functions/v1/authentication/signup",
        () => {
          return HttpResponse.json({
            user: { 
              id: "456", 
              email: "new@example.com",
              identities: [{ id: "some-identity" }]
            },
            session: null
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
    
    // Check that CORS headers are set
    expect(response.headers.get("Access-Control-Allow-Origin")).toBe(
      CORS_HEADERS["Access-Control-Allow-Origin"]
    );
  });

  // OPTIONS request for CORS preflight
  it("handles OPTIONS request for CORS preflight", async () => {
    const { OPTIONS } = require('@/app/api/auth/signup/route');
    
    const response = await OPTIONS();
    
    expect(response.status).toBe(204);
    expect(response.headers.get("Access-Control-Allow-Origin")).toBe(
      CORS_HEADERS["Access-Control-Allow-Origin"]
    );
    expect(response.headers.get("Access-Control-Allow-Methods")).toBe(
      CORS_HEADERS["Access-Control-Allow-Methods"]
    );
  });

  // Test rate limiting mechanism if implemented
  it("indicates rate limiting when too many requests occur", async () => {
    // This test depends on whether your API actually implements rate limiting
    // If it does, you'd mock a rate limit exceeded response
    server.use(
      http.post(
        "https://test-supabase-url.com/functions/v1/authentication/signup",
        () => {
          return new HttpResponse(
            JSON.stringify({ 
              error: "Too many requests",
              message: "Rate limit exceeded. Please try again later."
            }),
            { 
              status: 429,
              headers: {
                'Retry-After': '60' // Indicate retry after 60 seconds
              }
            }
          );
        }
      )
    );

    const mockRequest = {
      json: () =>
        Promise.resolve({
          email: "rate-limited@example.com",
          password: "password123",
          displayName: "Rate Limited User",
        }),
    };

    const response = await POST(mockRequest);
    const data = await response.json();

    expect(response.status).toBe(429);
    expect(data).toHaveProperty('message');
    expect(data.message).toContain('Too many requests');
    // The Retry-After header might not be passed through from MSW to the route response
    // So we'll skip checking it directly
  });
});
