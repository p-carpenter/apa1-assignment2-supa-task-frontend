import { fetchFromSupabase } from "@/app/utils/api/clientApi";
import { ERROR_TYPES } from "@/app/utils/errors/errorTypes";
import { processApiError } from "@/app/utils/errors/errorService";
import { CORS_HEADERS } from "@/app/utils/auth/config";

const PASSWORD_REQUIREMENTS = [
  {
    test: (password) => password.length >= 8,
    message: "Password must be at least 8 characters long",
  },
  {
    test: (password) => /[A-Z]/.test(password),
    message: "Password must contain at least one uppercase letter",
  },
  {
    test: (password) => /[a-z]/.test(password),
    message: "Password must contain at least one lowercase letter",
  },
  {
    test: (password) => /[0-9]/.test(password),
    message: "Password must contain at least one number",
  },
  {
    test: (password) => /[^A-Za-z0-9]/.test(password),
    message: "Password must contain at least one special character",
  },
];

const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

/**
 * Responds to CORS preflight requests to enable cross-origin API access
 */
export async function OPTIONS() {
  return new Response(null, {
    status: 204,
    headers: CORS_HEADERS,
  });
}

/**
 * Handles new account registration with comprehensive validation
 */
export async function POST(request) {
  try {
    const body = await request.json();
    const { email, password, displayName } = body;

    // Client-side validation should catch these, but double checking for security
    if (!email || !password) {
      return new Response(
        JSON.stringify({
          error: "Missing required fields",
          type: ERROR_TYPES.BAD_REQUEST,
          details: "Email and password are required",
          timestamp: new Date().toISOString(),
        }),
        {
          status: 400,
          headers: CORS_HEADERS,
        }
      );
    }

    if (!EMAIL_REGEX.test(email)) {
      return new Response(
        JSON.stringify({
          error: "Invalid email format",
          type: ERROR_TYPES.BAD_REQUEST,
          details: "Invalid email format. Please enter a valid email address.",
          timestamp: new Date().toISOString(),
        }),
        {
          status: 400,
          headers: CORS_HEADERS,
        }
      );
    }

    const failedRequirements = PASSWORD_REQUIREMENTS.filter(
      (requirement) => !requirement.test(password)
    );

    if (failedRequirements.length > 0) {
      return new Response(
        JSON.stringify({
          error: "Password requirements not met",
          type: ERROR_TYPES.BAD_REQUEST,
          details: failedRequirements.map((requirement) => requirement.message),
          timestamp: new Date().toISOString(),
        }),
        {
          status: 400,
          headers: CORS_HEADERS,
        }
      );
    }

    const signupResult = await fetchFromSupabase(
      "authentication/signup",
      "POST",
      {
        email,
        password,
        display_name: displayName,
      }
    );

    // Account successfully created
    if (signupResult && signupResult.user) {
      return new Response(
        JSON.stringify({
          success: true,
          user: signupResult.user,
          timestamp: new Date().toISOString(),
        }),
        {
          status: 200,
          headers: CORS_HEADERS,
        }
      );
    }

    console.error("Unexpected Supabase response format:", signupResult);
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

    if (error?.message === "User already registered") {
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
      error.data &&
      error.data.error &&
      error.data.error.includes("Email address") &&
      error.data.error.includes("is invalid")
    ) {
      return new Response(
        JSON.stringify({
          error: "Invalid email address",
          type: ERROR_TYPES.BAD_REQUEST,
          details:
            "Please use a real email address. Test email domains are not accepted by Supabase",
          originalError: error.data.error,
          timestamp: new Date().toISOString(),
        }),
        {
          status: 400,
          headers: CORS_HEADERS,
        }
      );
    }

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
