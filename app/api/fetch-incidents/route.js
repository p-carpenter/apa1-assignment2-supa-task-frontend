import { fetchFromSupabase } from "@/app/utils/api/clientApi";
import { processApiError } from "@/app/utils/errors/errorService";
import { CORS_HEADERS } from "@/app/utils/auth/config";

export const OPTIONS = async () => {
  return new Response(null, { status: 204, headers: CORS_HEADERS });
};

export const GET = async (request) => {
  try {
    const incidentsData = await fetchFromSupabase("tech-incidents", "GET");

    if (!Array.isArray(incidentsData)) {
      // Log warning to provide information to users but provide graceful fallback to client
      console.warn(
        "Invalid response format from Supabase. Returning empty array."
      );

      return new Response(
        JSON.stringify({
          // Empty array instead of null/undefined for consistent client handling
          data: [],
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
};
