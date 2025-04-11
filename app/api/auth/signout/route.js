import { fetchFromSupabase } from "@/app/utils/api/clientApi";
import { processApiError } from "@/app/utils/errors/errorService";
import { cookies } from "next/headers";
import { AUTH_COOKIE_NAMES, CORS_HEADERS } from "@/app/utils/auth/config";

/**
 * Handles OPTIONS requests for CORS preflight
 */
export const OPTIONS = async () => {
  return new Response(null, {
    status: 204,
    headers: CORS_HEADERS,
  });
};

/**
 * Handles user sign-out by clearing cookies and notifying Supabase
 */
export const POST = async () => {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get(AUTH_COOKIE_NAMES.ACCESS_TOKEN)?.value;
  const refreshToken = cookieStore.get(AUTH_COOKIE_NAMES.REFRESH_TOKEN)?.value;

  try {
    // Clear auth cookies regardless of Supabase response
    const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 0, // Expires immediately
      path: "/",
      sameSite: "lax",
    };

    cookieStore.set(AUTH_COOKIE_NAMES.ACCESS_TOKEN, "", cookieOptions);
    cookieStore.set(AUTH_COOKIE_NAMES.REFRESH_TOKEN, "", cookieOptions);

    if (accessToken && refreshToken) {
      try {
        await fetchFromSupabase("authentication/signout", "POST", null, {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
          Cookie: `${AUTH_COOKIE_NAMES.ACCESS_TOKEN}=${accessToken}; ${AUTH_COOKIE_NAMES.REFRESH_TOKEN}=${refreshToken}`,
        });
      } catch (supabaseError) {
        // Log but don't fail - user is still signed out locally due to cleared cookies
        console.warn(
          "Supabase signout failed, but cookies have been cleared:",
          supabaseError.message
        );
      }
    } else {
      console.log("No auth tokens found, skipping Supabase signout");
    }

    return new Response(
      JSON.stringify({
        success: true,
        timestamp: new Date().toISOString(),
      }),
      { status: 200, headers: CORS_HEADERS }
    );
  } catch (error) {
    console.error("Error in signout:", error);

    const standardError = processApiError(error);

    // Still return success but with a warning since cookies were likely cleared
    return new Response(
      JSON.stringify({
        success: true,
        warning: "Signout partially completed with errors",
        error: standardError.message,
        timestamp: new Date().toISOString(),
      }),
      { status: 200, headers: CORS_HEADERS }
    );
  }
};
