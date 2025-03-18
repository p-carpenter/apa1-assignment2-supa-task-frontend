import {
  withAuth,
  getSupabaseAuthHeaders,
} from "@/app/utils/api/authMiddleware";
import {
  createEndpointHandler,
  fetchFromSupabase,
} from "@/app/utils/api/apiUtils";

// Protected route so uses withAuth middleware
export const GET = createEndpointHandler(
  withAuth(async (req) => {
    const data = await fetchFromSupabase(
      "authentication/user",
      "GET",
      null,
      getSupabaseAuthHeaders(req)
    );
    return new Response(JSON.stringify(data), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  })
);
