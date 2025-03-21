import { fetchFromSupabase } from "@/app/utils/api/clientApi";
import { cookies } from "next/headers";
import { AUTH_CONFIG, CORS_HEADERS } from "@/app/utils/auth/config";
import { processApiError } from "@/app/utils/errors/errorService";

export const POST = async (req) => {
  try {
    const body = await req.json();
    const { email, password } = body;

    const data = await fetchFromSupabase("authentication/signin", "POST", {
      email,
      password,
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
          session: { expires_at: data.session.expires_at },
          timestamp: new Date().toISOString(),
        }),
        { status: 200, headers: CORS_HEADERS }
      );
    } else {
      throw new Error("Authentication succeeded but no session was created");
    }
  } catch (error) {
    console.error("Signin error:", error);

    const standardError = processApiError(error);

    return new Response(
      JSON.stringify({
        ...standardError,
        timestamp: new Date().toISOString(),
      }),
      {
        status: standardError.status,
        headers: CORS_HEADERS,
      }
    );
  }
};
