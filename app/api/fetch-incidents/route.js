import { fetchFromSupabase } from "@/app/utils/api/clientApi";
import { processApiError } from "@/app/utils/errors/errorService";
import { CORS_HEADERS } from "@/app/utils/auth/config";

export async function OPTIONS() {
  return new Response(null, { status: 204, headers: CORS_HEADERS });
}

export async function GET(req) {
  try {

    const path = "tech-incidents";
    const data = await fetchFromSupabase(path, "GET");

    if (!Array.isArray(data)) {
      console.warn(
        "Invalid response format from Supabase. Returning empty array."
      );
      return new Response(
        JSON.stringify({
          data: [],
          warning:
            "Invalid response format from database. Data has been reset to an empty array.",
          timestamp: new Date().toISOString(),
        }),
        { status: 200, headers: CORS_HEADERS }
      );
    }

    console.log(`Successfully fetched ${data.length} incidents`);

    return new Response(
      JSON.stringify({ data, timestamp: new Date().toISOString() }),
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
      { status: standardError.status || 500, headers: CORS_HEADERS }
    );
  }
}
