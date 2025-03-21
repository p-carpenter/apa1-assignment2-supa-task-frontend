import { fetchFromSupabase } from "@/app/utils/api/clientApi";
import { processApiError } from "@/app/utils/errors/errorService";
import { CORS_HEADERS } from "@/app/utils/auth/config";

export async function OPTIONS() {
  return new Response(null, {
    status: 204,
    headers: CORS_HEADERS,
  });
}

export async function POST(req) {
  try {
    const { email } = await req.json();

    if (!email) {
      throw new Error("Email is required");
    }

    await fetchFromSupabase("password-recovery", "POST", { email });

    return new Response(
      JSON.stringify({
        message: "Password reset instructions sent",
        timestamp: new Date().toISOString(),
      }),
      { status: 200, headers: CORS_HEADERS }
    );
  } catch (error) {
    console.error("Password recovery error:", error);

    const standardError = processApiError(error, {
      defaultMessage: "Failed to send password reset instructions",
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
