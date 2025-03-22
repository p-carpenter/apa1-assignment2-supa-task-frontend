import { server } from "../../app/utils/testing/test-utils";
import { http, HttpResponse } from "msw";
import {
  signIn,
  signUp,
  signOut,
  getCurrentUser,
  getProtectedData,
  addProtectedData,
} from "@/app/utils/auth/client";
import { ERROR_TYPES } from "@/app/utils/errors/errorTypes";

process.env.SUPABASE_ANON_KEY = "test-anon-key";

describe("Auth Utils", () => {
  const originalNavigator = global.navigator;

  beforeEach(() => {
    Object.defineProperty(global.navigator, "onLine", {
      value: true,
      configurable: true,
      writable: true,
    });
  });

  afterEach(() => {
    global.navigator = originalNavigator;
  });

  describe("signIn", () => {
    it("calls the signin API with correct credentials", async () => {
      server.use(
        http.post("/api/auth/signin", async ({ request }) => {
          const body = await request.json();
          const { email } = body;

          return HttpResponse.json({
            user: { id: "123", email },
            session: { token: "abc" },
            timestamp: new Date().toISOString(),
          });
        })
      );

      const credentials = {
        email: "test@example.com",
        password: "password123",
      };

      const result = await signIn(credentials);

      expect(result).toEqual({
        user: { id: "123", email: "test@example.com" },
        session: { token: "abc" },
        timestamp: expect.any(String),
      });
    });

    it("throws error when API returns an error", async () => {
      server.use(
        http.post("/api/auth/signin", () => {
          return new HttpResponse(
            JSON.stringify({
              error: "Invalid email or password. Please try again.",
              type: "invalid_credentials",
              status: 401,
              timestamp: new Date().toISOString(),
            }),
            { status: 401 }
          );
        })
      );

      const credentials = {
        email: "test@example.com",
        password: "wrong-password",
      };

      await expect(signIn(credentials)).rejects.toMatchObject({
        error: "Invalid email or password. Please try again.",
        type: "invalid_credentials",
      });
    });
  });

  describe("signUp", () => {
    it("calls the signup API with correct credentials", async () => {
      server.use(
        http.post("/api/auth/signup", async ({ request }) => {
          const body = await request.json();
          const { email } = body;

          return HttpResponse.json({
            user: { id: "456", email },
            session: { token: "def" },
            timestamp: new Date().toISOString(),
          });
        })
      );

      const credentials = {
        email: "new@example.com",
        password: "password123",
        displayName: "New User",
      };

      const result = await signUp(credentials);

      expect(result).toEqual({
        user: { id: "456", email: "new@example.com" },
        session: { token: "def" },
        timestamp: expect.any(String),
      });
    });

    it("throws error when API returns an error", async () => {
      server.use(
        http.post("/api/auth/signup", () => {
          return new HttpResponse(
            JSON.stringify({
              error: "Email already in use",
              type: "already_exists",
              status: 400,
              timestamp: new Date().toISOString(),
            }),
            { status: 400 }
          );
        })
      );

      const credentials = {
        email: "existing@example.com",
        password: "password123",
        displayName: "Existing User",
      };

      await expect(signUp(credentials)).rejects.toMatchObject({
        error: "Email already in use",
        type: "already_exists",
      });
    });
  });

  describe("signOut", () => {
    it("calls the signout API successfully", async () => {
      server.use(
        http.post("/api/auth/signout", () => {
          return HttpResponse.json({
            success: true,
            timestamp: new Date().toISOString(),
          });
        })
      );

      const result = await signOut();
      expect(result).toEqual({
        success: true,
        timestamp: expect.any(String),
      });
    });

    it("returns success with warning when signout API fails", async () => {
      server.use(
        http.post("/api/auth/signout", () => {
          return new HttpResponse(
            JSON.stringify({
              error: "Session not found",
              type: "session_not_found",
              status: 400,
              timestamp: new Date().toISOString(),
            }),
            { status: 400 }
          );
        })
      );

      const result = await signOut();
      expect(result).toEqual({
        success: true,
        warning: "Session not found",
      });
    });

    it("returns success with warning for offline scenario", async () => {
      Object.defineProperty(global.navigator, "onLine", { value: false });

      const result = await signOut();
      expect(result).toEqual({
        success: true,
        warning: "Offline signout - server session may still be active",
      });
    });
  });

  describe("getCurrentUser", () => {
    it("retrieves current user when authenticated", async () => {
      server.use(
        http.get("/api/auth/user", () => {
          return HttpResponse.json({
            user: { id: "123", email: "test@example.com" },
            session: { token: "abc" },
            timestamp: new Date().toISOString(),
          });
        })
      );

      const result = await getCurrentUser();
      expect(result).toEqual({
        user: { id: "123", email: "test@example.com" },
        session: { token: "abc" },
        timestamp: expect.any(String),
      });
    });

    it("returns null user and session when not authenticated", async () => {
      server.use(
        http.get("/api/auth/user", () => {
          return new HttpResponse(
            JSON.stringify({
              error: "Please sign in to continue.",
              type: "auth_required",
              status: 401,
              timestamp: new Date().toISOString(),
            }),
            { status: 401 }
          );
        })
      );

      const result = await getCurrentUser();
      expect(result).toEqual({
        user: null,
        session: null,
      });
    });

    it("returns null with error info for offline scenario", async () => {
      Object.defineProperty(global.navigator, "onLine", { value: false });

      const result = await getCurrentUser();
      expect(result).toEqual({
        user: null,
        session: null,
        error:
          "No internet connection. Authentication status cannot be verified.",
        type: "network_error",
      });
    });
  });

  describe("getProtectedData", () => {
    it("retrieves protected data when authenticated", async () => {
      server.use(
        http.get("/api/auth/protected", () => {
          return HttpResponse.json({
            data: "Protected data content",
            timestamp: new Date().toISOString(),
          });
        })
      );

      const result = await getProtectedData();
      expect(result).toEqual({
        data: "Protected data content",
        timestamp: expect.any(String),
      });
    });

    it("returns null when not authenticated", async () => {
      server.use(
        http.get("/api/auth/protected", () => {
          return new HttpResponse(
            JSON.stringify({
              error: "Unauthorized",
              type: "auth_required",
              status: 401,
              timestamp: new Date().toISOString(),
            }),
            { status: 401 }
          );
        })
      );

      const result = await getProtectedData();
      expect(result).toBeNull();
    });

    it("returns null for other API errors", async () => {
      server.use(
        http.get("/api/auth/protected", () => {
          return new HttpResponse(
            JSON.stringify({
              error: "Internal server error",
              type: "service_unavailable",
              status: 500,
              timestamp: new Date().toISOString(),
            }),
            { status: 500 }
          );
        })
      );

      const result = await getProtectedData();
      expect(result).toBeNull();
    });
  });

  describe("addProtectedData", () => {
    it("adds protected data when authenticated", async () => {
      server.use(
        http.post("/api/auth/protected", async () => {
          return HttpResponse.json({
            data: {
              success: true,
              message: "Data saved successfully",
            },
            timestamp: new Date().toISOString(),
          });
        })
      );

      const data = { item: "New protected item" };
      const result = await addProtectedData(data);

      expect(result).toEqual({
        data: {
          success: true,
          message: "Data saved successfully",
        },
        timestamp: expect.any(String),
      });
    });

    it("throws error when not authenticated", async () => {
      server.use(
        http.post("/api/auth/protected", () => {
          return new HttpResponse(
            JSON.stringify({
              error: "Please sign in to continue.",
              type: "auth_required",
              status: 401,
              timestamp: new Date().toISOString(),
            }),
            { status: 401 }
          );
        })
      );

      const data = { item: "New protected item" };
      await expect(addProtectedData(data)).rejects.toMatchObject({
        error: "Please sign in to continue.",
        type: "auth_required",
      });
    });

    it("throws validation error for invalid data", async () => {
      const invalidData = null;
      await expect(addProtectedData(invalidData)).rejects.toMatchObject({
        type: "validation_error",
      });
    });
  });
});
