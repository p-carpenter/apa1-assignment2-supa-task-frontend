import { fetchFromSupabase } from "@/app/utils/api/clientApi";
import { processApiError } from "@/app/utils/errors/errorService";
import { AUTH_COOKIE_NAMES, CORS_HEADERS } from "@/app/utils/auth/config";
import { cookies } from "next/headers";
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
 * Retrieves protected data that requires authentication
 */
export const GET = async (request) => {
  try {
    const cookieStore = await cookies();
    const accessToken = cookieStore.get(AUTH_COOKIE_NAMES.ACCESS_TOKEN)?.value;
    const refreshToken = cookieStore.get(
      AUTH_COOKIE_NAMES.REFRESH_TOKEN
    )?.value;

    if (!accessToken || !refreshToken) {
      return new Response(
        JSON.stringify({
          error: "Authentication required",
          type: ERROR_TYPES.AUTH_REQUIRED,
          timestamp: new Date().toISOString(),
        }),
        { status: 401, headers: CORS_HEADERS }
      );
    }

    const data = await fetchFromSupabase("protected-data", "GET", null, {
      Authorization: `Bearer ${accessToken}`,
      Cookie: `${AUTH_COOKIE_NAMES.ACCESS_TOKEN}=${accessToken}; ${AUTH_COOKIE_NAMES.REFRESH_TOKEN}=${refreshToken}`,
    });

    return new Response(
      JSON.stringify({
        data,
        timestamp: new Date().toISOString(),
      }),
      { status: 200, headers: CORS_HEADERS }
    );
  } catch (error) {
    console.error("Protected route GET error:", error);

    const standardError = processApiError(error, {
      defaultMessage: "Failed to access protected data",
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

/**
 * Submits data to a protected endpoint
 */
export const POST = async (request) => {
  try {
    const cookieStore = await cookies();
    const accessToken = cookieStore.get(AUTH_COOKIE_NAMES.ACCESS_TOKEN)?.value;
    const refreshToken = cookieStore.get(
      AUTH_COOKIE_NAMES.REFRESH_TOKEN
    )?.value;

    if (!accessToken || !refreshToken) {
      return new Response(
        JSON.stringify({
          error: "Authentication required",
          type: ERROR_TYPES.AUTH_REQUIRED,
          timestamp: new Date().toISOString(),
        }),
        { status: 401, headers: CORS_HEADERS }
      );
    }

    const data = await request.json();

    if (!data || typeof data !== "object") {
      const validationError = new Error("Invalid data format");
      validationError.status = 400;
      validationError.type = ERROR_TYPES.BAD_REQUEST;
      throw validationError;
    }

    try {
      const response = await fetchFromSupabase("protected-data", "POST", data, {
        Authorization: `Bearer ${accessToken}`,
        Cookie: `${AUTH_COOKIE_NAMES.ACCESS_TOKEN}=${accessToken}; ${AUTH_COOKIE_NAMES.REFRESH_TOKEN}=${refreshToken}`,
      });

      return new Response(
        JSON.stringify({
          data: response,
          success: true,
          timestamp: new Date().toISOString(),
        }),
        { status: 201, headers: CORS_HEADERS }
      );
    } catch (error) {
      if (error.status === 413) {
        const sizeError = new Error("Data exceeds maximum allowed size");
        sizeError.status = 413;
        sizeError.type = ERROR_TYPES.FILE_TOO_LARGE;
        throw sizeError;
      }

      // Re-throw the original error if no specific handling
      throw error;
    }
  } catch (error) {
    console.error("Protected route POST error:", error);

    const standardError = processApiError(error, {
      defaultMessage: "Failed to submit protected data",
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
