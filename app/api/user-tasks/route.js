import {
  withAuth,
  getSupabaseAuthHeaders,
} from "../../utils/api/authMiddleware";
import {
  createEndpointHandler,
  createResponse,
  createErrorResponse,
} from "../../utils/api/apiUtils";

/**
 * Helper function to handle user tasks API requests
 *
 * @param {string} method - HTTP method
 * @param {Object} req - Request object
 * @returns {Promise<Response>} - API response
 */
const handleUserTasksRequest = async (method, req) => {
  try {
    // Get auth headers from middleware
    const headers = getSupabaseAuthHeaders(req);

    // For POST requests, get the body
    let body = null;
    if (method === "POST") {
      body = await req.json();
    }

    const response = await fetch(
      `${process.env.SUPABASE_URL}/functions/v1/protected`,
      {
        method,
        headers,
        ...(body && { body: JSON.stringify(body) }),
      }
    );

    if (!response.ok) {
      const error = await response.json().catch(() => ({
        error: `Error: ${response.status}`,
      }));

      return createErrorResponse(
        error.error ||
          `Failed to ${method === "GET" ? "fetch" : "create"} task`,
        response.status
      );
    }

    const data = await response.json();
    return createResponse(data);
  } catch (error) {
    console.error(
      `Error ${method === "GET" ? "fetching" : "creating"} user tasks:`,
      error
    );
    return createErrorResponse(
      `Network error: ${error.message || `Failed to ${method === "GET" ? "fetch" : "create"} task`}`,
      500
    );
  }
};

// Protected GET endpoint for user tasks
export const GET = createEndpointHandler(
  withAuth(async (req) => handleUserTasksRequest("GET", req))
);

// Protected POST endpoint for user tasks
export const POST = createEndpointHandler(
  withAuth(async (req) => handleUserTasksRequest("POST", req))
);
