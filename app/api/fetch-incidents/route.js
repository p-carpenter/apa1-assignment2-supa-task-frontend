import {
  createEndpointHandler,
  callSupabaseFunction,
  createResponse,
  createErrorResponse,
} from "../../utils/api/apiUtils";

/**
 * Fetches all tech incidents
 */
export const GET = createEndpointHandler(async () => {
  try {
    console.log("Fetching incidents from Supabase function");

    const response = await callSupabaseFunction("tech-incidents");

    if (!response.ok) {
      console.error("Failed to fetch incidents:", response.status);
      const errorText = await response.text().catch(() => null);

      return createErrorResponse(
        `Supabase error: ${response.status}`,
        response.status,
        errorText
      );
    }

    const data = await response.json();
    console.log(`Successfully fetched ${data.length} incidents`);

    return createResponse(data);
  } catch (error) {
    console.error("Fetch incidents error:", error);
    throw error;
  }
});
