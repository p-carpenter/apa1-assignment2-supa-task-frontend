import { fetchFromSupabase } from "@/app/utils/api/clientApi";
import { cookies } from "next/headers";
import { AUTH_CONFIG, CORS_HEADERS } from "@/app/utils/auth/config";
import { processApiError } from "@/app/utils/errors/errorService";

/**
 * Handles user authentication and session establishment
 * 
 * @param {Request} request - The incoming request with user credentials
 * @returns {Response} JSON response with user data or error information
 */
export const POST = async (request) => {
  try {
    const { email, password } = await request.json();
    
    // Authenticate directly with Supabase backend
    const authResult = await fetchFromSupabase("authentication/signin", "POST", {
      email,
      password,
    });
    
    if (authResult.session) {
      // Persist authentication state with secure HTTP-only cookies
      const cookieStore = await cookies();
      
      // Short-lived token for active session state
      cookieStore.set("sb-access-token", authResult.session.access_token, {
        httpOnly: true, // Prevents JavaScript access to mitigate XSS attacks
        secure: process.env.NODE_ENV === "production", // HTTPS-only in production
        maxAge: AUTH_CONFIG.tokenExpiration.access,
        path: "/",
        sameSite: "lax", // Protects against CSRF while allowing normal navigation
      });
      
      // Long-lived token for session renewal without re-authentication
      cookieStore.set("sb-refresh-token", authResult.session.refresh_token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        maxAge: AUTH_CONFIG.tokenExpiration.refresh,
        path: "/",
        sameSite: "lax",
      });
      
      // Return minimal user data, deliberately excluding sensitive token information
      return new Response(
        JSON.stringify({
          user: authResult.user, // Basic user info for UI personalization
          session: { expires_at: authResult.session.expires_at }, // Only expose expiration for refresh logic
          timestamp: new Date().toISOString(),
        }),
        { status: 200, headers: CORS_HEADERS }
      );
    } else {
      throw new Error("Authentication succeeded but no session was created");
    }
  } catch (error) {
    console.error("Signin error:", error);
    
    // Transform API errors into consistent formats for client handling
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
