import {
  createEndpointHandler,
  fetchFromSupabase,
} from "@/app/utils/api/clientApi";
import { ERROR_TYPES } from "@/app/utils/api/errors/errorHandling";
import { cookies } from "next/headers";
import { AUTH_CONFIG } from "@/app/utils/auth/config";

export const POST = createEndpointHandler(async (req) => {
  try {
    const body = await req.json();

    if (!body.email || !body.password || !body.displayName) {
      return new Response(
        JSON.stringify({
          error: "Email, password, and display name are required",
          errorType: ERROR_TYPES.VALIDATION_ERROR,
        }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    const { email, password, displayName } = body;

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return new Response(
        JSON.stringify({
          error: "Invalid email format",
          errorType: ERROR_TYPES.VALIDATION_ERROR,
        }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // Password validation
    if (password.length < 8) {
      return new Response(
        JSON.stringify({
          error: "Password must be at least 8 characters",
          errorType: ERROR_TYPES.VALIDATION_ERROR,
        }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // Display name validation
    if (displayName.length < 2 || displayName.length > 50) {
      return new Response(
        JSON.stringify({
          error: "Display name must be between 2 and 50 characters",
          errorType: ERROR_TYPES.VALIDATION_ERROR,
        }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    const data = await fetchFromSupabase("authentication/signup", "POST", {
      email,
      password,
      display_name: displayName,
    });

    if (!data || !data.user) {
      return new Response(
        JSON.stringify({
          error: "Invalid signup response",
          errorType: ERROR_TYPES.SERVICE_UNAVAILABLE,
        }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }

    if (data.session) {
      const cookieStore = await cookies();

      cookieStore.set("sb-access-token", data.session.access_token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        maxAge: AUTH_CONFIG.tokenExpiration.access,
        path: "/",
        sameSite: "lax",
      });

      cookieStore.set("sb-refresh-token", data.session.refresh_token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        maxAge: AUTH_CONFIG.tokenExpiration.refresh,
        path: "/",
        sameSite: "lax",
      });
    } else {
      return new Response(
        JSON.stringify({
          error: "Account created but no session was established",
          errorType: ERROR_TYPES.SERVICE_UNAVAILABLE,
        }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({
        user: data.user,
        session: {
          // Only include non-sensitive session data
          expires_at: data.session.expires_at,
        },
      }),
      { status: 201, headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Signup error:", error);

    if (
      error.status === 409 ||
      (error.data && error.data.error && error.data.error.includes("exists"))
    ) {
      return new Response(
        JSON.stringify({
          error: "An account with this email already exists",
          errorType: ERROR_TYPES.ALREADY_EXISTS,
        }),
        { status: 409, headers: { "Content-Type": "application/json" } }
      );
    }

    if (error.status === 400) {
      return new Response(
        JSON.stringify({
          error: error.data?.error || "Invalid signup data",
          errorType: ERROR_TYPES.VALIDATION_ERROR,
        }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({
        error: "Failed to create account",
        errorType: ERROR_TYPES.UNKNOWN_ERROR,
      }),
      {
        status: error.status || 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
});
