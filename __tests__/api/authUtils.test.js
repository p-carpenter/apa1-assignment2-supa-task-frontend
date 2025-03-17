import { server } from "../../app/utils/testing/test-utils";
import { http, HttpResponse } from "msw";
import {
  signIn,
  signUp,
  signOut,
  getCurrentUser,
  getProtectedData,
  addProtectedData,
} from "@/app/utils/auth/authUtils";

// Set environment variables
process.env.SUPABASE_ANON_KEY = "test-anon-key";

describe("Auth Utils", () => {
  describe("signIn", () => {
    it("calls the signin API with correct credentials", async () => {
      // Set up a specific response for this test
      server.use(
        http.post("/api/auth/signin", async ({ request }) => {
          const body = await request.json();
          const { email } = body;

          return HttpResponse.json({
            user: { id: "123", email },
            session: { token: "abc" },
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
      });
    });

    it("throws error when API returns an error", async () => {
      // Set up an error response for this test
      server.use(
        http.post("/api/auth/signin", () => {
          return new HttpResponse(
            JSON.stringify({ error: "Invalid credentials" }),
            { status: 401 }
          );
        })
      );

      const credentials = {
        email: "test@example.com",
        password: "wrong-password",
      };

      await expect(signIn(credentials)).rejects.toThrow("Invalid credentials");
    });
  });

  describe("signUp", () => {
    it("calls the signup API with correct credentials", async () => {
      // Set up a specific response for this test
      server.use(
        http.post("/api/auth/signup", async ({ request }) => {
          const body = await request.json();
          const { email } = body;

          return HttpResponse.json({
            user: { id: "456", email },
            session: { token: "def" },
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
      });
    });

    it("throws error when API returns an error", async () => {
      server.use(
        http.post("/api/auth/signup", () => {
          return new HttpResponse(
            JSON.stringify({ error: "Email already in use" }),
            { status: 400 }
          );
        })
      );

      const credentials = {
        email: "existing@example.com",
        password: "password123",
        displayName: "Existing User",
      };

      await expect(signUp(credentials)).rejects.toThrow("Email already in use");
    });
  });

  describe("signOut", () => {
    it("calls the signout API successfully", async () => {
      server.use(
        http.post("/api/auth/signout", () => {
          return HttpResponse.json({ success: true });
        })
      );

      const result = await signOut();
      expect(result).toEqual({ success: true });
    });

    it("throws error when signout API fails", async () => {
      server.use(
        http.post("/api/auth/signout", () => {
          return new HttpResponse(
            JSON.stringify({ error: "Session not found" }),
            { status: 400 }
          );
        })
      );

      await expect(signOut()).rejects.toThrow("Session not found");
    });
  });

  describe("getCurrentUser", () => {
    it("retrieves current user when authenticated", async () => {
      server.use(
        http.get("/api/auth/user", () => {
          return HttpResponse.json({
            user: { id: "123", email: "test@example.com" },
            session: { token: "abc" },
          });
        })
      );

      const result = await getCurrentUser();
      expect(result).toEqual({
        user: { id: "123", email: "test@example.com" },
        session: { token: "abc" },
      });
    });

    it("returns null user and session when no user is authenticated", async () => {
      server.use(
        http.get("/api/auth/user", () => {
          return HttpResponse.json({
            user: null,
            session: null,
          });
        })
      );

      const result = await getCurrentUser();
      expect(result).toEqual({
        user: null,
        session: null,
      });
    });
  });

  describe("getProtectedData", () => {
    it("retrieves protected data when authenticated", async () => {
      server.use(
        http.get("/api/auth/protected", () => {
          return HttpResponse.json({ data: "Protected data content" });
        })
      );

      const result = await getProtectedData();
      expect(result).toEqual({ data: "Protected data content" });
    });

    it("returns null when not authenticated", async () => {
      server.use(
        http.get("/api/auth/protected", () => {
          return new HttpResponse(null, { status: 401 });
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
            success: true,
          });
        })
      );

      const data = { item: "New protected item" };
      const result = await addProtectedData(data);

      expect(result).toEqual({
        success: true,
      });
    });

    it("throws error when not authenticated", async () => {
      server.use(
        http.post("/api/auth/protected", () => {
          return new HttpResponse(JSON.stringify({ error: "Unauthorized" }), {
            status: 401,
          });
        })
      );

      const data = { item: "New protected item" };
      await expect(addProtectedData(data)).rejects.toThrow("Unauthorized");
    });
  });
});
