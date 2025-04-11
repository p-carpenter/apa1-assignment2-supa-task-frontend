import { fetchFromSupabase } from "@/app/utils/api/clientApi";
import { processApiError } from "@/app/utils/errors/errorService";
import { CORS_HEADERS } from "@/app/utils/auth/config";

/**
 * Handles OPTIONS requests for CORS preflight
 */
export const OPTIONS = async () => {
  return new Response(null, {
    status: 204,
    headers: CORS_HEADERS,
  });
};

/**
 * Deletes one or more tech incidents
 */
export const DELETE = async (request) => {
  try {
    const { ids } = await request.json();

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return new Response(
        JSON.stringify({
          error: "No valid incident IDs provided",
          timestamp: new Date().toISOString(),
        }),
        {
          status: 400,
          headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
        }
      );
    }

    const deletionResult = await fetchFromSupabase("tech-incidents", "DELETE", {
      ids,
    });

    return new Response(
      JSON.stringify({
        data: deletionResult,
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
        ...standardError,
        timestamp: new Date().toISOString(),
      }),
      {
        status: standardError.status,
        headers: CORS_HEADERS,
      }
    );
  }
};
