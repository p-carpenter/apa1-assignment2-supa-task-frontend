import { fetchFromSupabase } from "@/app/utils/api/clientApi";
import { processApiError } from "@/app/utils/errors/errorService";
import { CORS_HEADERS } from "@/app/utils/auth/config";

export async function OPTIONS() {
  return new Response(null, { status: 204, headers: CORS_HEADERS });
}

export async function POST(req) {
  try {
    const requestData = await req.json();

    if (!requestData.addition || !requestData.addition.name) {
      const validationError = new Error("Incident data with a name is required");
      validationError.status = 400; // Bad Request
      throw validationError;
    }

    const incidentData = requestData.addition;
    const payload = { addition: incidentData };

    if (incidentData.artifactType === "image" && requestData.fileData) {
      payload.fileData = requestData.fileData;
      payload.fileName = requestData.fileName || "unknown.jpg";
      payload.fileType = requestData.fileType || "image/jpeg";

      if (typeof payload.fileData === "string") {
        const base64Size = payload.fileData.length * 0.75;
        if (base64Size > 5 * 1024 * 1024) {
          const fileSizeError = new Error("File size exceeds 5MB limit");
          fileSizeError.status = 413; // Payload Too Large
          throw fileSizeError;
        }
      }
    }

    const data = await fetchFromSupabase("tech-incidents", "POST", payload);

    return new Response(
      JSON.stringify({ data, timestamp: new Date().toISOString() }),
      { status: 201, headers: CORS_HEADERS }
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
      { status: standardError.status || 500, headers: CORS_HEADERS }
    );
  }
}
