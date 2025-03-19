import { fetchFromSupabase } from "@/app/utils/api/clientApi";
import { processApiError } from "@/app/utils/errors/errorService";
import { CORS_HEADERS } from "@/app/utils/auth/config";

export async function OPTIONS() {
  return new Response(null, {
    status: 204,
    headers: CORS_HEADERS,
  });
}

export async function DELETE(req) {
  try {
    const url = new URL(req.url);
    const id = url.searchParams.get("id");

    if (!id) {
      throw new Error("Incident ID is required");
    }

    console.log(`🗑️ Deleting incident ID: ${id}`);
    const data = await fetchFromSupabase(`tech-incidents?id=${id}`, "DELETE");

    return new Response(
      JSON.stringify({
        success: true,
        timestamp: new Date().toISOString(),
      }),
      { status: 200, headers: CORS_HEADERS }
    );
  } catch (error) {
    console.error("Delete incident error:", error);

    const standardError = processApiError(error, {
      defaultMessage: "Failed to delete incident",
    });

    return new Response(
      JSON.stringify({
        error: standardError.message,
        errorType: standardError.type,
        details: standardError.details,
        timestamp: new Date().toISOString(),
      }),
      {
        status: standardError.status,
        headers: CORS_HEADERS,
      }
    );
  }
}
