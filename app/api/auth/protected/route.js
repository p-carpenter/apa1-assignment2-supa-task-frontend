import { fetchFromSupabase } from "@/app/utils/api/clientApi";
import { processApiError } from "@/app/utils/errors/errorService";
import { CORS_HEADERS } from "@/app/utils/auth/config";
import { cookies } from "next/headers";

export async function OPTIONS() {
  return new Response(null, {
    status: 204,
    headers: CORS_HEADERS,
  });
}

export async function GET(req) {
  try {
    const cookieStore = await cookies();
    const accessToken = cookieStore.get("sb-access-token")?.value;
    const refreshToken = cookieStore.get("sb-refresh-token")?.value;

    if (!accessToken || !refreshToken) {
      throw new Error("Authentication required");
    }

    const data = await fetchFromSupabase("protected-data", "GET", null, {
      Authorization: `Bearer ${accessToken}`,
      Cookie: `sb-access-token=${accessToken}; sb-refresh-token=${refreshToken}`,
    });

    return new Response(
      JSON.stringify({
        data,
        timestamp: new Date().toISOString(),
      }),
      { status: 200, headers: CORS_HEADERS }
    );
  } catch (error) {
    console.error("Protected data error:", error);

    const standardError = processApiError(error, {
      defaultMessage: "Failed to access protected data",
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

export async function POST(req) {
  try {
    const cookieStore = await cookies();
    const accessToken = cookieStore.get("sb-access-token")?.value;
    const refreshToken = cookieStore.get("sb-refresh-token")?.value;

    if (!accessToken || !refreshToken) {
      throw new Error("Authentication required");
    }

    const data = await req.json();

    const response = await fetchFromSupabase("protected-data", "POST", data, {
      Authorization: `Bearer ${accessToken}`,
      Cookie: `sb-access-token=${accessToken}; sb-refresh-token=${refreshToken}`,
    });

    return new Response(
      JSON.stringify({
        data: response,
        timestamp: new Date().toISOString(),
      }),
      { status: 201, headers: CORS_HEADERS }
    );
  } catch (error) {
    console.error("Protected data submission error:", error);

    const standardError = processApiError(error, {
      defaultMessage: "Failed to submit protected data",
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
