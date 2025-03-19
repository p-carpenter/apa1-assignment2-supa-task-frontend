import { cookies } from "next/headers";

/**
 * Authentication middleware for API routes
 *
 * @param {Function} handler - The API route handler
 * @returns {Function} - The protected handler
 */
export const withAuth = (handler) => async (req) => {
  try {
    const cookieStore = await cookies();
    const accessToken = cookieStore.get("sb-access-token")?.value;
    const refreshToken = cookieStore.get("sb-refresh-token")?.value;

    if (!accessToken || !refreshToken) {
      return new Response(
        JSON.stringify({
          error: "Unauthorized",
          message: "Authentication required",
        }),
        {
          status: 401,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Attach authentication details to request
    req.auth = {
      accessToken,
      refreshToken,
      cookies: `sb-access-token=${accessToken}; sb-refresh-token=${refreshToken}`,
    };

    return handler(req);
  } catch (error) {
    console.error("Auth middleware error:", error);
    return new Response(
      JSON.stringify({
        error: "Authentication Error",
        message: error.message || "Failed to authenticate request",
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
};


