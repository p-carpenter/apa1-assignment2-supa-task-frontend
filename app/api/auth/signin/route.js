import {
  createEndpointHandler,
  fetchFromSupabase,
} from "@/app/utils/api/clientApi";
import { ERROR_TYPES } from "@/app/utils/errors/errorTypes";
import { cookies } from "next/headers";

export const POST = createEndpointHandler(async (req) => {
  try {
    const body = await req.json();

    if (!body.email || !body.password) {
      return new Response(
        JSON.stringify({
          error: "Email and password are required",
          errorType: ERROR_TYPES.VALIDATION_ERROR,
        }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    const { email, password } = body;

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

    const data = await fetchFromSupabase("authentication/signin", "POST", {
      email,
      password,
    });

    if (!data || !data.user) {
      return new Response(
        JSON.stringify({
          error: "Invalid authentication response",
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
        maxAge: 3600,
        path: "/",
        sameSite: "lax",
      });

      cookieStore.set("sb-refresh-token", data.session.refresh_token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        maxAge: 7776000,
        path: "/",
        sameSite: "lax",
      });
    } else {
      return new Response(
        JSON.stringify({
          error: "Authentication succeeded but no session was created",
          errorType: ERROR_TYPES.SERVICE_UNAVAILABLE,
        }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ user: data.user, session: data.session }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Signin error:", error);

    if (error.status === 401) {
      return new Response(
        JSON.stringify({
          error: "Invalid email or password",
          errorType: ERROR_TYPES.INVALID_CREDENTIALS,
        }),
        { status: 401, headers: { "Content-Type": "application/json" } }
      );
    }

    if (error.status === 429) {
      return new Response(
        JSON.stringify({
          error: "Too many login attempts, please try again later",
          errorType: ERROR_TYPES.RATE_LIMITED,
        }),
        { status: 429, headers: { "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({
        error: "Authentication failed",
        errorType: ERROR_TYPES.UNKNOWN_ERROR,
      }),
      {
        status: error.status || 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
});
