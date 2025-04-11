import { fetchFromSupabase } from "@/app/utils/api/clientApi";
import { processApiError } from "@/app/utils/errors/errorService";
import { CORS_HEADERS } from "@/app/utils/auth/config";

/**
 * Handles OPTIONS requests for CORS preflight
 * Required to support cross-origin requests in production environment
 */
export const OPTIONS = async () => {
  return new Response(null, { status: 204, headers: CORS_HEADERS });
};

/**
 * Updates an existing tech incident in the database
 *
 * Supports both metadata updates and file uploads for artifacts
 * Implements validation for:
 * - Required fields
 * - File size limits
 * - Request structure
 *
 * @returns {Response} JSON response with updated data or error details
 */
export const PUT = async (request) => {
  try {
    const requestData = await request.json();

    if (!requestData.id) {
      const validationError = new Error("Incident ID is required");
      validationError.status = 400;
      throw validationError;
    }

    if (!requestData.update) {
      const validationError = new Error("Update data is required");
      validationError.status = 400;
      throw validationError;
    }

    const { id, update } = requestData;
    let payload = { id, update };

    if (update.artifactType === "image" && requestData.fileData) {
      payload.fileData = requestData.fileData;
      payload.fileName = requestData.fileName || "unknown.jpg";
      payload.fileType = requestData.fileType || "image/jpeg";

      if (typeof payload.fileData === "string") {
        const approximateFileSize = payload.fileData.length * 0.75;
        const maxSizeBytes = 5 * 1024 * 1024; // 5MB limit

        if (approximateFileSize > maxSizeBytes) {
          const fileSizeError = new Error("File size exceeds 5MB limit");
          fileSizeError.status = 413; // Payload Too Large
          throw fileSizeError;
        }
      }
    }

    const updatedData = await fetchFromSupabase(
      "tech-incidents",
      "PUT",
      payload
    );

    return new Response(
      JSON.stringify({
        data: updatedData,
        timestamp: new Date().toISOString(),
      }),
      { status: 200, headers: CORS_HEADERS }
    );
  } catch (error) {
    console.error("Update incident error:", error);

    const standardError = processApiError(error, {
      defaultMessage: "Failed to update incident",
    });

    return new Response(
      JSON.stringify({
        ...standardError,
        timestamp: new Date().toISOString(),
      }),
      { status: standardError.status || 500, headers: CORS_HEADERS }
    );
  }
};
