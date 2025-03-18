import {
  withAuth,
  getSupabaseAuthHeaders,
} from "../../utils/api/authMiddleware";
import { createEndpointHandler } from "../../utils/api/apiUtils";

// Helper function to handle user tasks API requests
const handleUserTasksRequest = async (method, req, body = null) => {
  try {
    const headers = getSupabaseAuthHeaders(req);
    
    if (!headers.Authorization || !headers.Cookie) {
      throw new Error("Missing authentication headers");
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
      let errorData;
      try {
        errorData = await response.json();
      } catch {
        errorData = { error: `Error: ${response.status}` };
      }

      const apiError = new Error(
        errorData.error || `Failed to ${method === "GET" ? "fetch" : "create"} task`
      );
      apiError.status = response.status;
      throw apiError;
    }

    return await response.json();
  } catch (error) {
    console.error(`Error in ${method} task request:`, error);
    throw error;
  }
};

// Protected GET endpoint for user tasks
export const GET = createEndpointHandler(
  withAuth(async (req) => {
    try {
      // Extract query parameters for filtering/pagination if needed
      const url = new URL(req.url);
      const limit = url.searchParams.get('limit');
      const offset = url.searchParams.get('offset');
      const status = url.searchParams.get('status');
      
      // Could pass query params to handleUserTasksRequest if needed

      const tasks = await handleUserTasksRequest("GET", req);
      
      if (!tasks || !Array.isArray(tasks)) {
        return new Response(
          JSON.stringify({ error: "Invalid response format from server" }),
          { status: 500, headers: { "Content-Type": "application/json" } }
        );
      }
      
      return new Response(JSON.stringify(tasks), {
        status: 200,
        headers: { 
          "Content-Type": "application/json",
          "Cache-Control": "max-age=60, stale-while-revalidate=300"
        }
      });
    } catch (error) {
      console.error("GET tasks error:", error);
      
      if (error.status === 401 || error.status === 403) {
        return new Response(
          JSON.stringify({ error: "Not authorized to access tasks" }),
          { status: error.status, headers: { "Content-Type": "application/json" } }
        );
      }
      
      return new Response(
        JSON.stringify({ error: "Failed to fetch tasks" }),
        { status: error.status || 500, headers: { "Content-Type": "application/json" } }
      );
    }
  })
);

// Protected POST endpoint for user tasks
export const POST = createEndpointHandler(
  withAuth(async (req) => {
    try {
      const body = await req.json();

      // Validate required fields
      if (!body.name) {
        return new Response(
          JSON.stringify({ error: "Task name is required" }),
          { status: 400, headers: { "Content-Type": "application/json" } }
        );
      }

      // If due date is provided, validate format
      if (body.due_date) {
        const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
        if (!dateRegex.test(body.due_date)) {
          return new Response(
            JSON.stringify({ error: "Invalid date format. Use YYYY-MM-DD" }),
            { status: 400, headers: { "Content-Type": "application/json" } }
          );
        }
      }

      const response = await handleUserTasksRequest("POST", req, body);
      
      return new Response(JSON.stringify(response), {
        status: 201,
        headers: { "Content-Type": "application/json" }
      });
    } catch (error) {
      console.error("POST task error:", error);

      // Map common errors to appropriate status codes
      if (error.status === 413) {
        return new Response(
          JSON.stringify({ error: "Request body too large" }),
          { status: 413, headers: { "Content-Type": "application/json" } }
        );
      } 
      
      if (error.status === 401 || error.status === 403) {
        return new Response(
          JSON.stringify({ error: "Not authorized to create tasks" }),
          { status: error.status, headers: { "Content-Type": "application/json" } }
        );
      }
      
      if (error.status === 400) {
        return new Response(
          JSON.stringify({ error: error.message || "Invalid task data" }),
          { status: 400, headers: { "Content-Type": "application/json" } }
        );
      }

      return new Response(
        JSON.stringify({ error: error.message || "Failed to create task" }),
        { status: error.status || 500, headers: { "Content-Type": "application/json" } }
      );
    }
  })
);

// Optional: Add PUT and DELETE methods for updating and deleting tasks
