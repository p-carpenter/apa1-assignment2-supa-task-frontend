import { fetchFromSupabase } from "@/app/utils/api/clientApi";
import { processApiError } from "@/app/utils/errors/errorService";
import { CORS_HEADERS } from "@/app/utils/auth/config";

export async function OPTIONS() {
  return new Response(null, { status: 204, headers: CORS_HEADERS });
}

export async function GET(request) {
  try {
    const incidentsData = await fetchFromSupabase("tech-incidents", "GET");

    if (!Array.isArray(incidentsData)) {
      // Log warning for monitoring but provide graceful fallback to client
      console.warn(
        "Invalid response format from Supabase. Returning empty array."
      );

      return new Response(
        JSON.stringify({
          data: [], // Empty array instead of null/undefined for consistent client handling
          warning:
            "Invalid response format from database. Data has been reset to an empty array.",
          timestamp: new Date().toISOString(),
        }),
        { status: 200, headers: CORS_HEADERS }
      );
    }

    return new Response(
      JSON.stringify({
        data: incidentsData,
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
        ...standardError,
        timestamp: new Date().toISOString(),
      }),
      {
        status: standardError.status || 500,
        headers: CORS_HEADERS,
      }
    );
  }
}
