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

// Email validation regex
const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

// Validate the password against all requirements
function validatePassword(password) {
  const failedRequirements = PASSWORD_REQUIREMENTS.filter(
    (requirement) => !requirement.test(password)
  );

  return {
    isValid: failedRequirements.length === 0,
    failedRequirements,
  };
}

// Validate email format
function validateEmail(email) {
  return {
    isValid: EMAIL_REGEX.test(email),
    message: "Invalid email format. Please enter a valid email address."
  };
}

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

    const emailValidation = validateEmail(email);
    if (!emailValidation.isValid) {
      return new Response(
        JSON.stringify({
          error: "Invalid email format",
          type: ERROR_TYPES.BAD_REQUEST,
          details: emailValidation.message,
          timestamp: new Date().toISOString(),
        }),
        {
          status: 400,
          headers: CORS_HEADERS,
        }
      );
    }

    const passwordValidation = validatePassword(password);
    if (!passwordValidation.isValid) {
      return new Response(
        JSON.stringify({
          error: "Password requirements not met",
          type: ERROR_TYPES.BAD_REQUEST,
          details: passwordValidation.failedRequirements.map((r) => r.message),
          timestamp: new Date().toISOString(),
        }),
        {
          status: 400,
          headers: CORS_HEADERS,
        }
      );
    }

    const data = await fetchFromSupabase("authentication/signup", "POST", {
      email,
      password,
      display_name: displayName,
    });

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
