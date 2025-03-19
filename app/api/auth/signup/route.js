import { fetchFromSupabase } from "@/app/utils/api/clientApi";
import { ERROR_TYPES } from "@/app/utils/errors/errorTypes";
import { processApiError } from "@/app/utils/errors/errorService";
import { cookies } from "next/headers";
import { AUTH_CONFIG, CORS_HEADERS } from "@/app/utils/auth/config";

export async function OPTIONS() {
  return new Response(null, {
    status: 204,
    headers: CORS_HEADERS,
  });
}

export async function POST(req) {
  try {
    const body = await req.json();
    const { email, password, displayName } = body;

    const data = await fetchFromSupabase("authentication/signup", "POST", {
      email,
      password,
      display_name: displayName,
    });

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

      return new Response(
        JSON.stringify({
          user: data.user,
          session: {
            expires_at: data.session.expires_at,
          },
          timestamp: new Date().toISOString(),
        }),
        { status: 201, headers: CORS_HEADERS }
      );
    } else {
      throw new Error("Account created but no session was established");
    }
  } catch (error) {
    console.error("Signup error:", error);

    const standardError = processApiError(error, {
      defaultMessage: "Failed to create account",
    });

    return new Response(
      JSON.stringify({
        error: standardError.message,
        errorType: standardError.type,
        details: standardError.details,
        timestamp: new Date().toISOString(),
      }),
      {
        status: standardError.status,
        headers: CORS_HEADERS,
      }
    );
  }
}
