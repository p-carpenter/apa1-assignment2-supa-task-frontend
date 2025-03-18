import {
  withAuth,
  getSupabaseAuthHeaders,
} from "@/app/utils/api/authMiddleware";
import {
  createEndpointHandler,
  fetchFromSupabase,
} from "@/app/utils/api/apiUtils";

export const GET = createEndpointHandler(
  withAuth(async (req) => {
    try {
      if (!req.auth || !req.auth.accessToken) {
        return new Response(
          JSON.stringify({ error: "No valid authentication token" }),
          { status: 401, headers: { "Content-Type": "application/json" } }
        );
      }

      const data = await fetchFromSupabase(
        "authentication/user",
        "GET",
        null,
        getSupabaseAuthHeaders(req)
      );
      
      if (!data || !data.user) {
        return new Response(
          JSON.stringify({ error: "Invalid user response" }),
          { status: 500, headers: { "Content-Type": "application/json" } }
        );
      }

      return new Response(
        JSON.stringify(data),
        { status: 200, headers: { "Content-Type": "application/json" } }
      );
    } catch (error) {
      console.error("User info fetch error:", error);
      
      if (error.status === 401) {
        return new Response(
          JSON.stringify({ error: "Authentication expired or invalid" }),
          { status: 401, headers: { "Content-Type": "application/json" } }
        );
      }
      
      return new Response(
        JSON.stringify({ error: "Failed to retrieve user information" }),
        { status: error.status || 500, headers: { "Content-Type": "application/json" } }
      );
    }
  })
);