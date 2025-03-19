/**
 * Common API utilities for handling requests and responses
 */
import { processApiError } from "@/app/utils/errors/errorService";
import { ERROR_TYPES } from "../errors/errorTypes";

/**
 * Fetch with standardized error handling to use in calling internal API routes
 *
 * @param {string} url - The URL to fetch
 * @param {Object} options - Fetch options
 * @param {Object} errorOptions - Options for error handling
 * @returns {Promise<any>} - The response data
 * @throws {Error} - If the response is not ok
 */
export const fetchWithErrorHandling = async (
  url,
  options = {},
  errorOptions = {}
) => {
  try {
    const response = await fetch(url, options);

    if (!response.ok) {
      let errorData;
      try {
        errorData = await response.json();
      } catch {
        errorData = {
          error: `Error: ${response.status} ${response.statusText}`,
        };
      }

      const error = new Error(
        errorData.error || errorData.message || `Error: ${response.status}`
      );
      error.status = response.status;
      error.data = errorData;

      // Explicitly mark auth-related errors for easier handling
      if (response.status === 401) {
        error.type = ERROR_TYPES.AUTH_REQUIRED;
        error.isAuthError = true;
      }

      throw error;
    }

    return await response.json();
  } catch (error) {
    const standardError = processApiError(error, errorOptions);

    throw standardError;
  }
};

/**
 * Create a standard API endpoint handler with CORS and error handling
 *
 * @param {Function} handler - The API route handler function
 * @returns {Function} - The wrapped handler with error and CORS handling
 */
export const createEndpointHandler = (handler) => async (req) => {
  const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
    "Access-Control-Allow-Headers": "Authorization, Content-Type",
  };

  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: corsHeaders });
  }

  try {
    return await handler(req, corsHeaders);
  } catch (error) {
    console.error(`Handler error:`, error);

    let errorMessage = error.message || "Internal Server Error";
    let statusCode = error.status || 500;

    return new Response(
      JSON.stringify({
        error: errorMessage,
        timestamp: new Date().toISOString(),
      }),
      {
        status: statusCode,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );
  }
};

/**
 * Generic function to handle API requests to Supabase
 * @param {string} path - The API endpoint path (e.g., "tech-incidents").
 * @param {string} method - The HTTP method (GET, POST, PUT, DELETE).
 * @param {Object} [body] - Optional request body for POST/PUT.
 * @param {Object} [headers] - Optional additional headers.
 * @returns {Promise<any>} - The response data or throws an error.
 */
export const fetchFromSupabase = async (
  path,
  method,
  body = null,
  headers = {}
) => {
  const { SUPABASE_URL, SUPABASE_ANON_KEY } = process.env;

  const defaultHeaders = {
    Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
    "Content-Type": "application/json",
    ...headers,
  };

  try {
    if (typeof window !== "undefined" && !window.navigator.onLine) {
      const offlineError = new Error(
        "No internet connection. Please check your network and try again."
      );
      offlineError.isOffline = true;
      throw offlineError;
    }

    if (!path) {
      throw new Error("API path is required for Supabase requests");
    }

    if (
      !["GET", "POST", "PUT", "DELETE", "PATCH"].includes(method.toUpperCase())
    ) {
      throw new Error(`Invalid HTTP method: ${method}`);
    }

    const response = await fetch(`${SUPABASE_URL}/functions/v1/${path}`, {
      method,
      headers: defaultHeaders,
      ...(body && { body: JSON.stringify(body) }),
    });

    if (!response.ok) {
      let errorData;
      try {
        errorData = await response.json();
      } catch (e) {
        errorData = { message: await response.text() };
      }

      const error = new Error(
        errorData.error ||
          errorData.message ||
          `Supabase API error (${response.status}): ${path}`
      );

      error.status = response.status;
      error.path = path;
      error.method = method;

      switch (response.status) {
        case 400:
          error.type = "VALIDATION_ERROR";
          error.message =
            errorData.error || "Invalid data format or parameters";
          break;
        case 401:
          error.type = "UNAUTHORIZED";
          error.message = "Authentication required. Please sign in again.";
          break;
        case 403:
          error.type = "FORBIDDEN";
          error.message = "You do not have permission to perform this action";
          break;
        case 404:
          error.type = "NOT_FOUND";
          error.message = `Resource not found: ${path}`;
          break;
        case 409:
          error.type = "CONFLICT";
          error.message =
            "The requested operation conflicts with the current state";
          break;
        case 413:
          error.type = "PAYLOAD_TOO_LARGE";
          error.message = "The file you're trying to upload is too large";
          break;
        case 429:
          error.type = "RATE_LIMITED";
          error.message = "Too many requests. Please try again later";
          break;
        case 500:
        case 502:
        case 503:
        case 504:
          error.type = "SERVER_ERROR";
          error.message = "Server error. Please try again later";
          break;
      }

      throw error;
    }

    // Handle successful but empty responses
    if (response.status === 204) {
      return null;
    }

    try {
      return await response.json();
    } catch (e) {
      // Handle case where there's no JSON response but status is OK
      if (response.ok) {
        return { success: true };
      }
      throw new Error(`Failed to parse response from ${path}: ${e.message}`);
    }
  } catch (error) {
    if (!error.path) {
      error.path = path;
      error.method = method;
    }

    // Log all errors with request details
    console.error(`Supabase API Request Failed (${method} ${path}):`, error);

    if (error.name === "TypeError" && error.message.includes("fetch")) {
      const enhancedError = new Error(
        `Network error while connecting to Supabase. Please check your connection.`
      );
      enhancedError.originalError = error;
      enhancedError.type = "NETWORK_ERROR";
      throw enhancedError;
    }

    throw error;
  }
};
