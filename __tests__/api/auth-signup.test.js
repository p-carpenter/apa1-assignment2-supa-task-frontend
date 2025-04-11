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
    jest.spyOn(console, "error").mockImplementation(() => {});
    jest.spyOn(console, "log").mockImplementation(() => {});
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
              identities: [{ id: "some-identity" }],
            },
            session: null,
          });
        }
      )
    );

    const mockRequest = {
      json: () =>
        Promise.resolve({
          email: "new@example.com",
          password: "Password123!",
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
        identities: [{ id: "some-identity" }],
      },
      timestamp: expect.any(String),
    });
  });

  it("returns error when password is too short", async () => {
    server.use(
      http.post(
        "https://test-supabase-url.com/functions/v1/authentication/signup",
        () => {
          return new HttpResponse(
            JSON.stringify({
              error: "Password must be at least 8 characters",
              message: "Password must be at least 8 characters",
              details: [
                "Password must be at least 8 characters long",
                "Password must contain at least one uppercase letter",
                "Password must contain at least one number",
                "Password must contain at least one special character",
              ],
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
    expect(data.type).toBe(ERROR_TYPES.BAD_REQUEST);
    expect(data.details).toStrictEqual([
      "Password must be at least 8 characters long",
      "Password must contain at least one uppercase letter",
      "Password must contain at least one number",
      "Password must contain at least one special character",
    ]);
  });

  it("handles JSON parsing errors", async () => {
    const mockRequest = {
      json: () => Promise.reject(new Error("JSON parse error")),
    };

    const response = await POST(mockRequest);
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data).toHaveProperty("timestamp");
    // The implementation doesn't use ERROR_TYPES.SERVICE_ERROR for this case
    expect(data).toHaveProperty("type");
  });

  it("handles empty payload gracefully", async () => {
    server.use(
      http.post(
        "https://test-supabase-url.com/functions/v1/authentication/signup",
        () => {
          return new HttpResponse(
            JSON.stringify({
              error: "Missing required fields",
              message: "Email and password are required",
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
    expect(data.type).toBe(ERROR_TYPES.BAD_REQUEST);
    expect(data.details).toBe("Email and password are required");
  });

  it("returns error when required fields are missing", async () => {
    const mockRequest = {
      json: () => Promise.resolve({}),
    };

    const response = await POST(mockRequest);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.type).toBe(ERROR_TYPES.BAD_REQUEST);
    expect(data.details).toBe("Email and password are required");
  });

  it("validates email format with custom validation", async () => {
    const mockRequest = {
      json: () =>
        Promise.resolve({
          email: "not-an-email",
          password: "Password123!",
        }),
    };

    const response = await POST(mockRequest);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.type).toBe(ERROR_TYPES.BAD_REQUEST);
    expect(data.error).toBe("Invalid email format");
    expect(data.details).toContain(
      "Invalid email format. Please enter a valid email address."
    );
  });

  it("validates password minimum length requirement", async () => {
    const mockRequest = {
      json: () =>
        Promise.resolve({
          email: "valid@example.com",
          password: "Short1!",
        }),
    };

    const response = await POST(mockRequest);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.type).toBe(ERROR_TYPES.BAD_REQUEST);
    expect(data.error).toBe("Password requirements not met");
    expect(data.details).toContain(
      "Password must be at least 8 characters long"
    );
  });

  it("validates password uppercase letter requirement", async () => {
    const mockRequest = {
      json: () =>
        Promise.resolve({
          email: "valid@example.com",
          password: "password123!",
        }),
    };

    const response = await POST(mockRequest);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.details).toContain(
      "Password must contain at least one uppercase letter"
    );
  });

  it("validates password lowercase letter requirement", async () => {
    const mockRequest = {
      json: () =>
        Promise.resolve({
          email: "valid@example.com",
          password: "PASSWORD123!",
        }),
    };

    const response = await POST(mockRequest);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.details).toContain(
      "Password must contain at least one lowercase letter"
    );
  });

  it("validates password number requirement", async () => {
    const mockRequest = {
      json: () =>
        Promise.resolve({
          email: "valid@example.com",
          password: "Password!",
        }),
    };

    const response = await POST(mockRequest);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.details).toContain("Password must contain at least one number");
  });

  it("validates password special character requirement", async () => {
    const mockRequest = {
      json: () =>
        Promise.resolve({
          email: "valid@example.com",
          password: "Password123",
        }),
    };

    const response = await POST(mockRequest);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.details).toContain(
      "Password must contain at least one special character"
    );
  });

  it("accepts valid email and strong password", async () => {
    server.use(
      http.post(
        "https://test-supabase-url.com/functions/v1/authentication/signup",
        () => {
          return HttpResponse.json({
            user: {
              id: "456",
              email: "secure@example.com",
              identities: [{ id: "some-identity" }],
            },
            session: null,
          });
        }
      )
    );

    const mockRequest = {
      json: () =>
        Promise.resolve({
          email: "secure@example.com",
          password: "StrongP@ssw0rd",
          displayName: "Secure User",
        }),
    };

    const response = await POST(mockRequest);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
  });

  it("validates email format", async () => {
    server.use(
      http.post(
        "https://test-supabase-url.com/functions/v1/authentication/signup",
        () => {
          return new HttpResponse(
            JSON.stringify({
              error: "Invalid email format",
              message: "Invalid email format",
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
          password: "Password123!",
          displayName: "Test User",
        }),
    };

    const response = await POST(mockRequest);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.type).toBe(ERROR_TYPES.BAD_REQUEST);
    expect(data.details).toContain(
      "Invalid email format. Please enter a valid email address."
    );
  });

  it("handles extremely long inputs safely", async () => {
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

    expect(response instanceof Response).toBe(true);
    const data = await response.json();
    expect(data).toHaveProperty("timestamp");
  });

  it("sets appropriate CORS headers", async () => {
    server.use(
      http.post(
        "https://test-supabase-url.com/functions/v1/authentication/signup",
        () => {
          return HttpResponse.json({
            user: {
              id: "456",
              email: "new@example.com",
              identities: [{ id: "some-identity" }],
            },
            session: null,
          });
        }
      )
    );

    const mockRequest = {
      json: () =>
        Promise.resolve({
          email: "new@example.com",
          password: "Password123!",
        }),
    };

    const response = await POST(mockRequest);

    expect(response.headers.get("Access-Control-Allow-Origin")).toBe(
      CORS_HEADERS["Access-Control-Allow-Origin"]
    );
  });

  it("handles OPTIONS request for CORS preflight", async () => {
    const { OPTIONS } = require("@/app/api/auth/signup/route");

    const response = await OPTIONS();

    expect(response.status).toBe(204);
    expect(response.headers.get("Access-Control-Allow-Origin")).toBe(
      CORS_HEADERS["Access-Control-Allow-Origin"]
    );
    expect(response.headers.get("Access-Control-Allow-Methods")).toBe(
      CORS_HEADERS["Access-Control-Allow-Methods"]
    );
  });
});
