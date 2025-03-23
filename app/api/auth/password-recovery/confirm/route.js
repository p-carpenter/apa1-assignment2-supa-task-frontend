import { fetchFromSupabase } from "@/app/utils/api/clientApi";
import { processApiError } from "@/app/utils/errors/errorService";
import { CORS_HEADERS } from "@/app/utils/auth/config";
import { ERROR_TYPES } from "@/app/utils/errors/errorTypes";

/**
 * Handles OPTIONS requests for CORS preflight
 */
export async function OPTIONS() {
  return new Response(null, {
    status: 204,
    headers: CORS_HEADERS,
  });
}

/**
 * Confirms password reset with token, email, and new password
 */
export async function POST(request) {
  try {
    const { email, password, token } = await request.json();

    if (!email) {
      return new Response(
        JSON.stringify({
          error: "Email is required",
          type: ERROR_TYPES.BAD_REQUEST,
          status: 400,
          timestamp: new Date().toISOString(),
        }),
        { status: 400, headers: CORS_HEADERS }
      );
    }

    if (!password) {
      return new Response(
        JSON.stringify({
          error: "Password is required",
          type: ERROR_TYPES.BAD_REQUEST,
          status: 400,
          timestamp: new Date().toISOString(),
        }),
        { status: 400, headers: CORS_HEADERS }
      );
    }

    if (!token) {
      return new Response(
        JSON.stringify({
          error: "Reset token is required",
          type: ERROR_TYPES.BAD_REQUEST,
          status: 400,
          timestamp: new Date().toISOString(),
        }),
        { status: 400, headers: CORS_HEADERS }
      );
    }

    const cleanedToken = token.includes("access_token")
      ? token.split("=")[1]
      : token;

    try {
      await fetchFromSupabase("password-recovery/confirm", "POST", {
        email,
        password,
        token: cleanedToken,
      });

      return new Response(
        JSON.stringify({
          message: "Password has been reset successfully",
          success: true,
          timestamp: new Date().toISOString(),
        }),
        { status: 200, headers: CORS_HEADERS }
      );
    } catch (supabaseError) {
      if (
        supabaseError.status === 400 &&
        supabaseError.data?.error?.includes("token")
      ) {
        const tokenError = new Error("Invalid or expired reset token");
        tokenError.type = ERROR_TYPES.TOKEN_EXPIRED;
        tokenError.status = 400;
        throw tokenError;
      }

      if (supabaseError.status === 404) {
        const notFoundError = new Error(
          "No account found with this email address"
        );
        notFoundError.type = ERROR_TYPES.NOT_FOUND;
        notFoundError.status = 404;
        throw notFoundError;
      }

      // Re-throw for general error handling
      throw supabaseError;
    }
  } catch (error) {
    console.error("Password reset confirmation error:", error);

    const standardError = processApiError(error, {
      defaultMessage: "Failed to reset password",
    });

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
}
