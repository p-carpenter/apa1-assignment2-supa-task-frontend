import { fetchFromSupabase } from "@/app/utils/api/clientApi";
import { processApiError } from "@/app/utils/errors/errorService";
import { CORS_HEADERS } from "@/app/utils/auth/config";

export const OPTIONS = async () => {
  return new Response(null, { status: 204, headers: CORS_HEADERS });
};

export const POST = async (request) => {
  try {
    const incidentSubmission = await request.json();

    if (!incidentSubmission.addition || !incidentSubmission.addition.name) {
      const validationError = new Error(
        "Incident data with a name is required"
      );
      validationError.status = 400; // Bad Request
      throw validationError;
    }

    const incidentData = incidentSubmission.addition;
    const payload = { addition: incidentData };

    if (incidentData.artifactType === "image" && incidentSubmission.fileData) {
      payload.fileData = incidentSubmission.fileData;

      payload.fileName = incidentSubmission.fileName || "unknown.jpg";
      payload.fileType = incidentSubmission.fileType || "image/jpeg";

      if (typeof payload.fileData === "string") {
        // Convert base64 string length to approximate file size in bytes
        const approximateFileSize = payload.fileData.length * 0.75;
        const maxSizeBytes = 5 * 1024 * 1024; // 5MB limit

        if (approximateFileSize > maxSizeBytes) {
          const fileSizeError = new Error("File size exceeds 5MB limit");
          fileSizeError.status = 413; // Payload Too Large
          throw fileSizeError;
        }
      }
    }

    const creationResult = await fetchFromSupabase(
      "tech-incidents",
      "POST",
      payload
    );

    return new Response(
      JSON.stringify({
        data: creationResult,
        timestamp: new Date().toISOString(),
      }),
      {
        status: 201, // Created
        headers: CORS_HEADERS,
      }
    );
  } catch (error) {
    console.error("New incident error:", error);

    const standardError = processApiError(error, {
      defaultMessage: "Failed to create incident",
    });

    return new Response(
      JSON.stringify({
        ...standardError,
        timestamp: new Date().toISOString(),
      }),
      {
        status: standardError.status || 500,
        headers: CORS_HEADERS,
      }
    );
  }
};
