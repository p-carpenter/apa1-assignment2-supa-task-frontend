import { server, rest } from "../test-utils";
import {
  signIn,
  signUp,
  signOut,
  getCurrentUser,
  getProtectedData,
  addProtectedData
} from "@/app/utils/auth/authUtils";

// Set environment variables
process.env.SUPABASE_ANON_KEY = "test-anon-key";

// Make sure we have the globals for fetch
const fetch = global.fetch;

describe("Auth Utils", () => {
  describe("signIn", () => {
    it("calls the signin API with correct credentials", async () => {
      // Set up a specific response for this test
      server.use(
        rest.post("/api/auth/signin", (req, res, ctx) => {
          const { email } = req.body;
          return res(
            ctx.status(200),
            ctx.json({
              user: { id: "123", email },
              session: { token: "abc" }
            })
          );
        })
      );

      const credentials = {
        email: "test@example.com",
        password: "password123",
      };

      const result = await signIn(credentials);

      expect(result).toEqual({
        user: { id: "123", email: "test@example.com" },
        session: { token: "abc" }
      });
    });

    it("throws error when API returns an error", async () => {
      // Set up an error response for this test
      server.use(
        rest.post("/api/auth/signin", (req, res, ctx) => {
          return res(
            ctx.status(401),
            ctx.json({ error: "Invalid credentials" })
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
        rest.post("/api/auth/signup", (req, res, ctx) => {
          const { email } = req.body;
          return res(
            ctx.status(200),
            ctx.json({
              user: { id: "456", email },
              session: { token: "def" }
            })
          );
        })
      );

      const credentials = {
        email: "new@example.com",
        password: "password123",
        displayName: "New User"
      };

      const result = await signUp(credentials);

      expect(result).toEqual({
        user: { id: "456", email: "new@example.com" },
        session: { token: "def" }
      });
    });

    it("throws error when API returns an error", async () => {
      // Set up an error response for this test
      server.use(
        