import { fetchFromSupabase } from "@/app/utils/api/clientApi";
import { processApiError } from "@/app/utils/errors/errorService";
import { CORS_HEADERS } from "@/app/utils/auth/config";
import { ERROR_TYPES } from "@/app/utils/errors/errorTypes";

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
 * Handles password recovery requests by sending reset instructions
 */
export const POST = async (request) => {
  try {
    const { email } = await request.json();

    // Simple validation - require an email
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

    try {
      await fetchFromSupabase("password-recovery", "POST", { email });

      return new Response(
        JSON.stringify({
          message: "Password reset instructions sent",
          success: true,
          timestamp: new Date().toISOString(),
        }),
        { status: 200, headers: CORS_HEADERS }
      );
    } catch (supabaseError) {
      // Re-throw other errors
      throw supabaseError;
    }
  } catch (error) {
    console.error("Password recovery error:", error);

    const standardError = processApiError(error, {
      defaultMessage: "Failed to send password reset instructions",
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
};
