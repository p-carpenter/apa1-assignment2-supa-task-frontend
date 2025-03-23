import { processApiError } from "../errors/errorService";
import { ERROR_TYPES } from "../errors/errorTypes";

/**
 * Generic function to handle API requests to Supabase
 * 
 * @param {string} path - The API endpoint path (e.g., "tech-incidents")
 * @param {string} method - The HTTP method (GET, POST, PUT, DELETE)
 * @param {Object} [body=null] - Optional request body for POST/PUT
 * @param {Object} [headers={}] - Optional additional headers
 * @returns {Promise<any>} The response data
 * @throws {Error} Processed API error with standardized format
 */
export const fetchFromSupabase = async (
  path,
  method,
  body = null,
  headers = {}
) => {
  const { SUPABASE_URL, SUPABASE_ANON_KEY } = process.env;

  try {
    validateRequest(path, method);
    checkInternetConnection();

    const defaultHeaders = {
      Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
      "Content-Type": "application/json",
      ...headers,
    };

    const response = await fetch(`${SUPABASE_URL}/functions/v1/${path}`, {
      method,
      headers: defaultHeaders,
      ...(body && { body: JSON.stringify(body) }),
    });

    return handleResponse(response, path, method);
  } catch (error) {
    return handleError(error, path, method);
  }
};

/**
 * Validates the request parameters
 * 
 * @param {string} path - API endpoint path
 * @param {string} method - HTTP method
 * @throws {Error} Validation error if parameters are invalid
 */
function validateRequest(path, method) {
  if (!path) {
    throw new Error("API path is required for Supabase requests");
  }

  if (!["GET", "POST", "PUT", "DELETE"].includes(method.toUpperCase())) {
    throw new Error(`Invalid HTTP method: ${method}`);
  }
}

/**
 * Checks if the client has an internet connection
 * 
 * @throws {Error} Network error if offline
 */
function checkInternetConnection() {
  if (typeof window !== "undefined" && !window.navigator.onLine) {
    const offlineError = new Error(
      "No internet connection. Please check your network and try again."
    );
    offlineError.isOffline = true;
    offlineError.type = ERROR_TYPES.NETWORK_ERROR;
    throw offlineError;
  }
}

/**
 * Handles the API response
 * 
 * @param {Response} response - Fetch API response
 * @param {string} path - API endpoint path
 * @param {string} method - HTTP method
 * @returns {Promise<any>} Parsed response data
 * @throws {Error} API error if response is not OK
 */
async function handleResponse(response, path, method) {
  // Handle error responses
  if (!response.ok) {
    throw await createErrorFromResponse(response, path, method);
  }

  // Handle successful but empty responses
  if (response.status === 204) {
    return null;
  }

  // Parse JSON response
  try {
    return await response.json();
  } catch (e) {
    // Handle case where there's no JSON response but status is OK
    if (response.ok) {
      return { success: true };
    }
    throw new Error(`Failed to parse response from ${path}: ${e.message}`);
  }
}

/**
 * Creates an error object from an API error response
 * 
 * @param {Response} response - Fetch API response
 * @param {string} path - API endpoint path
 * @param {string} method - HTTP method
 * @returns {Promise<Error>} Error object with additional properties
 */
async function createErrorFromResponse(response, path, method) {
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
  error.data = errorData;

  return processApiError(error);
}

/**
 * Handles errors during API requests
 * 
 * @param {Error} error - The error that occurred
 * @param {string} path - API endpoint path
 * @param {string} method - HTTP method
 * @throws {Error} Processed API error
 */
function handleError(error, path, method) {
  if (!error.path) {
    error.path = path;
    error.method = method;
  }

  console.error(`Supabase API Request Failed (${method} ${path}):`, error);

  if (!error.isProcessed) {
    throw processApiError(error);
  }

  throw error;
}
