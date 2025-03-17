import { cookies } from "next/headers";

// API URL for Supabase Edge Functions
const { SUPABASE_URL, SUPABASE_ANON_KEY } = process.env;

export async function GET(request) {
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
      const response = await fetch(
        `${process.env.SUPABASE_URL}/functions/v1/protected`,
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
          JSON.stringify({ error: error.error || "Failed to fetch tasks" }),
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
      // Handle network errors specifically
      console.error("Network error:", fetchError);
      return new Response(JSON.stringify({ error: "Failed to fetch tasks" }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }
  } catch (error) {
    // Handle general errors
    console.error("Error fetching user tasks:", error);
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
        `${process.env.SUPABASE_URL}/functions/v1/protected`,
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
          JSON.stringify({ error: error.error || "Failed to create task" }),
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
      // Handle network errors specifically
      console.error("Network error:", fetchError);
      return new Response(JSON.stringify({ error: "Failed to create task" }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }
  } catch (error) {
    // Handle general errors
    console.error("Error creating user task:", error);
    return new Response(JSON.stringify({ error: "Internal Server Error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
