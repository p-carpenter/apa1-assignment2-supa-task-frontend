import {
  withAuth,
  getSupabaseAuthHeaders,
} from "../../utils/api/authMiddleware";
import { createEndpointHandler } from "../../utils/api/apiUtils";

// Helper function to handle user tasks API requests
const handleUserTasksRequest = async (method, req) => {
  const headers = getSupabaseAuthHeaders(req);

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

    const apiError = new Error(
      error.error || `Failed to ${method === "GET" ? "fetch" : "create"} task`
    );
    apiError.status = response.status;
    throw apiError;
  }

  return await response.json();
};

// Protected GET endpoint for user tasks
export const GET = createEndpointHandler(
  withAuth(async (req) => handleUserTasksRequest("GET", req))
);

// Protected POST endpoint for user tasks
export const POST = createEndpointHandler(
  withAuth(async (req) => handleUserTasksRequest("POST", req))
);
