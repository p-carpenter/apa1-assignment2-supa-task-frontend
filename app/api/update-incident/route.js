import { fetchFromSupabase } from "@/app/utils/api/clientApi";
import { processApiError } from "@/app/utils/errors/errorService";
import { CORS_HEADERS } from "@/app/utils/auth/config";

export async function OPTIONS() {
  return new Response(null, { status: 204, headers: CORS_HEADERS });
}

export async function PUT(req) {
  try {
    const requestData = await req.json();

    if (!requestData.id || !requestData.update) {
      throw new Error("Incident ID and update are required");
    }

    const { id, update } = requestData;
    let payload = { id, update };

    if (update.artifactType === "image" && requestData.fileData) {
      payload.fileData = requestData.fileData;
      payload.fileName = requestData.fileName || "unknown.jpg";
      payload.fileType = requestData.fileType || "image/jpeg";

      if (typeof payload.fileData === "string") {
        const base64Size = payload.fileData.length * 0.75;
        if (base64Size > 5 * 1024 * 1024) {
          throw new Error("File size exceeds 5MB limit");
        }
      }
    }

    console.log(`Updating incident ID: ${id}`);
    const data = await fetchFromSupabase("tech-incidents", "PUT", payload);

    return new Response(
      JSON.stringify({ data, timestamp: new Date().toISOString() }),
      { status: 200, headers: CORS_HEADERS }
    );
  } catch (error) {
    console.error("Update incident error:", error);
    const standardError = processApiError(error, {
      defaultMessage: "Failed to update incident",
    });

    return new Response(
      JSON.stringify({
        error: standardError.message,
        errorType: standardError.type,
        details: standardError.details,
        timestamp: new Date().toISOString(),
      }),
      { status: standardError.status || 500, headers: CORS_HEADERS }
    );
  }
}
