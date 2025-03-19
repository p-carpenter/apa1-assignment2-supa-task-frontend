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
    const { email, password, token } = await req.json();

    if (!email || !password || !token) {
      throw new Error("Email, password, and token are required");
    }

    const cleanedToken = token.includes("access_token")
      ? token.split("=")[1]
      : token;

    await fetchFromSupabase("password-recovery/confirm", "POST", {
      email,
      password,
      token: cleanedToken,
    });

    return new Response(
      JSON.stringify({
        message: "Password has been reset successfully",
        timestamp: new Date().toISOString(),
      }),
      { status: 200, headers: CORS_HEADERS }
    );
  } catch (error) {
    console.error("Password reset confirmation error:", error);

    const standardError = processApiError(error, {
      defaultMessage: "Failed to reset password",
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
