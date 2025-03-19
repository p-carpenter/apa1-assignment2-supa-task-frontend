import {
  createEndpointHandler,
  fetchFromSupabase,
} from "@/app/utils/api/clientApi";
import { cookies } from "next/headers";

export const POST = createEndpointHandler(async (req) => {
  try {
    const body = await req.json();

    if (!body.email || !body.password) {
      return new Response(
        JSON.stringify({ error: "Email and password are required" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    const { email, password, displayName } = body;

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return new Response(JSON.stringify({ error: "Invalid email format" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    if (password.length < 6) {
      return new Response(
        JSON.stringify({ error: "Password must be at least 6 characters" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    const data = await fetchFromSupabase("authentication/signup", "POST", {
      email,
      password,
      displayName,
    });

    if (
      data.user &&
      Array.isArray(data.user.identities) &&
      data.user.identities.length === 0 &&
      !data.session
    ) {
      return new Response(
        JSON.stringify({
          error: "User already exists",
          message:
            "An account with this email already exists. Please log in instead.",
        }),
        { status: 400, headers: { "Content-Type": "application/json" } }
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
    }

    return new Response(
      JSON.stringify({ user: data.user, session: data.session }),
      { status: 201, headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Signup error:", error);

    if (error.message && error.message.includes("already exists")) {
      return new Response(
        JSON.stringify({
          error: "User already exists",
          message:
            "An account with this email already exists. Please log in instead.",
        }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    if (error.message && error.message.includes("password")) {
      return new Response(JSON.stringify({ error: error.message }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ error: "Failed to create account" }), {
      status: error.status || 500,
      headers: { "Content-Type": "application/json" },
    });
  }
});
