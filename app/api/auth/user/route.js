import { processApiError } from "@/app/utils/errors/errorService";
import { CORS_HEADERS } from "@/app/utils/auth/config";
import { getServerSession } from "../../../utils/auth/server";

export async function GET() {
  try {
    const { user, session } = await getServerSession();

    if (!user) {
      const error = new Error("No active session found");
      error.status = 401;
      const standardError = processApiError(error);

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

    return new Response(
      JSON.stringify({
        user,
        session,
        timestamp: new Date().toISOString(),
      }),
      { status: 200, headers: CORS_HEADERS }
    );
  } catch (error) {
    console.error("User fetch error:", error);

    const standardError = processApiError(error, {
      defaultMessage: "Failed to verify authentication status",
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
}
