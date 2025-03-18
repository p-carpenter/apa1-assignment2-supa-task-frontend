import {
  createEndpointHandler,
  callSupabaseFunction,
  createResponse,
  createErrorResponse,
} from "../../utils/api/apiUtils";

/**
 * Create a new tech incident
 */
export const POST = createEndpointHandler(async (req) => {
  try {
    const requestData = await req.json();
    const incidentData = requestData.addition;

    // Ensure date format is consistent
    if (incidentData.incident_date) {
      const parts = incidentData.incident_date.split("/");
      if (parts.length === 3) {
        incidentData.incident_date = `${parts[2]}-${parts[1]}-${parts[0]}`;
      }
    }

    const payload = {
      addition: incidentData,
    };

    // Add file data if present
    if (incidentData.artifactType === "image" && requestData.fileData) {
      payload.fileData = requestData.fileData;
      payload.fileName = requestData.fileName;
      payload.fileType = requestData.fileType;
    }

    console.log(
      "Sending payload to Supabase:",
      JSON.stringify(
        {
          ...payload,
          fileData: payload.fileData ? "[Base64 data]" : undefined,
        },
        null,
        2
      )
    );

    const response = await callSupabaseFunction(
      "tech-incidents",
      "POST",
      payload
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Supabase error: ${response.status}`, errorText);

      return createErrorResponse(
        `Supabase error: ${response.status}`,
        response.status,
        errorText
      );
    }

    const data = await response.json();
    return createResponse(data);
  } catch (error) {
    console.error("Error in new-incident route:", error);
    throw error;
  }
});
