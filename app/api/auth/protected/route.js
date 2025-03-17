import { cookies } from "next/headers";

export async function GET(request) {
  try {
    // Get tokens from cookies
    const cookieStore = cookies();
    const accessToken = cookieStore.get("sb-access-token")?.value;
    const refreshToken = cookieStore.get("sb-refresh-token")?.value;

    if (!accessToken || !refreshToken) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }

    try {
      // Call Supabase edge function
      const response = await fetch(
        `${process.env.SUPABASE_URL}/functions/v1/validate-auth`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Cookie: `sb-access-token=${accessToken}; sb-refresh-token=${refreshToken}`,
            Authorization: `Bearer ${process.env.SUPABASE_ANON_KEY}`,
          },
        }
      );

      if (!response.ok) {
        const error = await response.json();
        return new Response(
          JSON.stringify({
            error: error.error || "Failed to fetch protected data",
          }),
          {
            status: response.status,
            headers: { "Content-Type": "application/json" },
          }
        );
      }

      const data = await response.json();
      return new Response(JSON.stringify(data), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    } catch (fetchError) {
      // Network errors go here
      console.error("Network error:", fetchError);
      return new Response(JSON.stringify({ error: "Failed to fetch" }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }
  } catch (error) {
    // General errors go here
    console.error("Protected data error:", error);
    return new Response(JSON.stringify({ error: "Internal Server Error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}

export async function POST(request) {
  try {
    const cookieStore = cookies();
    const accessToken = cookieStore.get("sb-access-token")?.value;
    const refreshToken = cookieStore.get("sb-refresh-token")?.value;

    if (!accessToken || !refreshToken) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }

    try {
      const body = await request.json();

      const response = await fetch(
        `${process.env.SUPABASE_URL}/functions/v1/validate-auth`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Cookie: `sb-access-token=${accessToken}; sb-refresh-token=${refreshToken}`,
            Authorization: `Bearer ${process.env.SUPABASE_ANON_KEY}`,
          },
          body: JSON.stringify(body),
        }
      );

      if (!response.ok) {
        const error = await response.json();
        return new Response(
          JSON.stringify({ error: error.error || "Failed to add item" }),
          {
            status: response.status,
            headers: { "Content-Type": "application/json" },
          }
        );
      }

      const data = await response.json();
      return new Response(JSON.stringify(data), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    } catch (fetchError) {
      // Network errors go here
      console.error("Network error:", fetchError);
      return new Response(
        JSON.stringify({ error: "Failed to process request" }),
        {
          status: 500,
          headers: { "Content-Type": "application/json" },
        }
      );
    }
  } catch (error) {
    // General errors go here
    console.error("Protected post error:", error);
    return new Response(JSON.stringify({ error: "Internal Server Error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
