import { cookies } from "next/headers";
import { AUTH_COOKIE_NAMES } from "../config";

/**
 * Authentication middleware for API routes
 * Ensures the request contains valid authentication tokens
 *
 * @param {Function} handler - The API route handler
 * @returns {Function} The protected handler that verifies authentication
 */
export const withAuth = (handler) => async (req) => {
  try {
    const { accessToken, refreshToken, cookieString } = await extractAuthTokens();

    if (!isAuthenticated(accessToken, refreshToken)) {
      return createAuthenticationErrorResponse();
    }

    // Attach authentication details to request
    const authenticatedRequest = attachAuthToRequest(req, accessToken, refreshToken, cookieString);

    return handler(authenticatedRequest);
  } catch (error) {
    return createAuthMiddlewareErrorResponse(error);
  }
};

/**
 * Extracts authentication tokens from cookies
 * 
 * @returns {Promise<Object>} Object containing tokens and cookie string
 */
async function extractAuthTokens() {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get(AUTH_COOKIE_NAMES.ACCESS_TOKEN)?.value;
  const refreshToken = cookieStore.get(AUTH_COOKIE_NAMES.REFRESH_TOKEN)?.value;
  const cookieString = `${AUTH_COOKIE_NAMES.ACCESS_TOKEN}=${accessToken}; ${AUTH_COOKIE_NAMES.REFRESH_TOKEN}=${refreshToken}`;
  
  return { accessToken, refreshToken, cookieString };
}

/**
 * Checks if the request has valid authentication tokens
 * 
 * @param {string|undefined} accessToken - Access token
 * @param {string|undefined} refreshToken - Refresh token
 * @returns {boolean} True if authenticated, false otherwise
 */
function isAuthenticated(accessToken, refreshToken) {
  return Boolean(accessToken && refreshToken);
}

/**
 * Creates an authentication error response
 * 
 * @returns {Response} Authentication error response
 */
function createAuthenticationErrorResponse() {
  return new Response(
    JSON.stringify({
      message: "Could not find authentication details. If you wish to contribute, please register.",
    }),
    {
      status: 401,
      headers: { "Content-Type": "application/json" },
    }
  );
}

/**
 * Attaches authentication details to the request
 * 
 * @param {Request} req - Original request
 * @param {string} accessToken - Access token
 * @param {string} refreshToken - Refresh token
 * @param {string} cookieString - Cookie string for headers
 * @returns {Request} Request with auth details attached
 */
function attachAuthToRequest(req, accessToken, refreshToken, cookieString) {
  req.auth = {
    accessToken,
    refreshToken,
    cookies: cookieString,
  };
  
  return req;
}

/**
 * Creates an error response for middleware failures
 * 
 * @param {Error} error - Error that occurred
 * @returns {Response} Error response
 */
function createAuthMiddlewareErrorResponse(error) {
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
