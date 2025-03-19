import { fetchFromSupabase } from "@/app/utils/api/clientApi";
import { processApiError } from "@/app/utils/errors/errorService";
import { cookies } from "next/headers";
import { CORS_HEADERS } from "@/app/utils/auth/config";

export async function OPTIONS() {
  return new Response(null, {
    status: 204,
    headers: CORS_HEADERS,
  });
}

export async function POST(req) {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("sb-access-token")?.value;
  const refreshToken = cookieStore.get("sb-refresh-token")?.value;

  try {
    cookieStore.set("sb-access-token", "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 0,
      path: "/",
      sameSite: "lax",
    });
    cookieStore.set("sb-refresh-token", "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 0,
      path: "/",
      sameSite: "lax",
    });

    if (accessToken && refreshToken) {
      try {
        await fetchFromSupabase("authentication/signout", "POST", null, {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
          Cookie: `sb-access-token=${accessToken}; sb-refresh-token=${refreshToken}`,
        });
      } catch (error) {
        console.warn(
          "Supabase signout failed, but cookies have been cleared:",
          error.message
        );
      }
    } else {
      console.log("No auth tokens found, skipping Supabase signout");
    }

    return new Response(
      JSON.stringify({
        success: true,
        timestamp: new Date().toISOString(),
      }),
      { status: 200, headers: CORS_HEADERS }
    );
  } catch (error) {
    console.error("Error in signout:", error);

    const standardError = processApiError(error);

    return new Response(
      JSON.stringify({
        success: true,
        warning: "Signout partially completed with errors",
        error: standardError.message,
        timestamp: new Date().toISOString(),
      }),
      { status: 200, headers: CORS_HEADERS }
    );
  }
}
