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
      offlineError.type = ERROR_TYPES.NETWORK_ERROR;
      throw offlineError;
    }

    if (!path) {
      throw new Error("API path is required for Supabase requests");
    }

    if (!["GET", "POST", "PUT", "DELETE"].includes(method.toUpperCase())) {
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
      error.data = errorData;

      const processedError = processApiError(error);
      throw processedError;
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

    console.error(`Supabase API Request Failed (${method} ${path}):`, error);

    if (!error.isProcessed) {
      throw processApiError(error);
    }

    throw error;
  }
};
