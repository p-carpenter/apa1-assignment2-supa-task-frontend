import { fetchFromSupabase } from "@/app/utils/api/clientApi";
import { processApiError } from "@/app/utils/errors/errorService";
import { CORS_HEADERS } from "@/app/utils/auth/config";

// Handle OPTIONS requests for CORS
export async function OPTIONS() {
  return new Response(null, {
    status: 204,
    headers: CORS_HEADERS,
  });
}

export async function GET(req) {
  try {
    const url = new URL(req.url);
    const limit = url.searchParams.get("limit");
    const offset = url.searchParams.get("offset");
    const category = url.searchParams.get("category");

    let path = "tech-incidents";
    const queryParams = new URLSearchParams();

    if (limit) queryParams.append("limit", limit);
    if (offset) queryParams.append("offset", offset);
    if (category) queryParams.append("category", category);

    const queryString = queryParams.toString();
    if (queryString) {
      path += `?${queryString}`;
    }

    const data = await fetchFromSupabase(path, "GET");

    if (!data || !Array.isArray(data)) {
      throw new Error("Invalid response format from server");
    }

    return new Response(
      JSON.stringify({
        data,
        timestamp: new Date().toISOString(),
      }),
      { status: 200, headers: CORS_HEADERS }
    );
  } catch (error) {
    console.error("Fetch incidents error:", error);

    const standardError = processApiError(error, {
      defaultMessage: "Failed to fetch incidents",
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
