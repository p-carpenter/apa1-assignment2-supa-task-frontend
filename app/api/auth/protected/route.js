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
    const data = await fetchFromSupabase(
      "validate-auth",
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

export const POST = createEndpointHandler(
  withAuth(async (req) => {
    const body = await req.json();
    const data = await fetchFromSupabase(
      "validate-auth",
      "POST",
      body,
      getSupabaseAuthHeaders(req)
    );
    return new Response(JSON.stringify(data), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  })
);
