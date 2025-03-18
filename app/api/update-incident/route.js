import {
  createEndpointHandler,
  callSupabaseFunction,
  createResponse,
  createErrorResponse,
} from "../../utils/api/apiUtils";

/**
 * Update an existing tech incident
 */
export const PUT = createEndpointHandler(async (req) => {
  try {
    const body = await req.json();
    console.log("Update request body:", {
      ...body,
      fileData: body.fileData ? "[Base64 data]" : undefined,
    });

    // Extract the id and update data
    const { id, update } = body;

    if (!id) {
      return createErrorResponse("Incident ID is required", 400);
    }

    // Create the payload with the necessary data
    const payload = { id, update };

    if (update.artifactType === "image" && body.fileData) {
      payload.fileData = body.fileData;
      payload.fileName = body.fileName;
      payload.fileType = body.fileType;
    }

    // Forward the request to Supabase Edge Function
    const response = await callSupabaseFunction(
      "tech-incidents",
      "PUT",
      payload
    );

    if (!response.ok) {
      console.error("Supabase update error:", response.status);
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
    console.error("Update error:", error);
    throw error;
  }
});
