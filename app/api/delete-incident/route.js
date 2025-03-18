import {
  createEndpointHandler,
  callSupabaseFunction,
  createResponse,
  createErrorResponse,
} from "../../utils/api/apiUtils";

/**
 * Delete tech incidents by ID
 */
export const DELETE = createEndpointHandler(async (req) => {
  try {
    const body = await req.json();
    const { ids } = body;

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return createErrorResponse("No valid incident IDs provided", 400);
    }

    console.log(`Attempting to delete ${ids.length} incidents:`, ids);

    // Forward the request to Supabase Edge Function
    const response = await callSupabaseFunction("tech-incidents", "DELETE", {
      ids,
    });

    if (!response.ok) {
      console.error("Supabase delete error:", response.status);
      const errorText = await response.text().catch(() => null);

      return createErrorResponse(
        `Supabase error: ${response.status}`,
        response.status,
        errorText
      );
    }

    // Get updated data and return it
    const data = await response.json();
    return createResponse(data);
  } catch (error) {
    console.error("Delete error:", error);
    throw error;
  }
});
