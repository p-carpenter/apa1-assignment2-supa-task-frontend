import { fetchFromSupabase } from "@/app/utils/api/clientApi";
import { ERROR_TYPES } from "@/app/utils/errors/errorTypes";
import { processApiError } from "@/app/utils/errors/errorService";
import { CORS_HEADERS } from "@/app/utils/auth/config";

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

    // Log request data for debugging (remove in production)
    console.log("Signup request:", { email, displayName });

    const data = await fetchFromSupabase("authentication/signup", "POST", {
      email,
      password,
      display_name: displayName,
    });

    // Log the response data for debugging
    console.log("Supabase signup response:", JSON.stringify(data));

    if (
      data &&
      data.user &&
      data.user.identities &&
      data.user.identities.length === 0
    ) {
      return new Response(
        JSON.stringify({
          error: "Email already exists",
          type: ERROR_TYPES.ALREADY_EXISTS,
          details: "This email is already registered",
          timestamp: new Date().toISOString(),
        }),
        {
          status: 409,
          headers: CORS_HEADERS,
        }
      );
    }

    if (
      data &&
      data.user &&
      !data.session &&
      data.user.identities &&
      data.user.identities.length > 0
    ) {
      return new Response(
        JSON.stringify({
          success: true,
          user: data.user,
          timestamp: new Date().toISOString(),
        }),
        {
          status: 200,
          headers: CORS_HEADERS,
        }
      );
    }

    // If we got here, we have an unexpected response format
    console.error("Unexpected Supabase response format:", data);
    return new Response(
      JSON.stringify({
        error: "Unable to process signup",
        type: ERROR_TYPES.SERVICE_ERROR,
        details:
          "Received an unexpected response from the authentication service",
        timestamp: new Date().toISOString(),
      }),
      {
        status: 500,
        headers: CORS_HEADERS,
      }
    );
  } catch (error) {
    console.error("Signup error:", error);

    const standardError = processApiError(error, {
      defaultMessage: "Failed to create account",
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
