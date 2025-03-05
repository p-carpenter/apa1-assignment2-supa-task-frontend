export async function GET(req) {
  const { SUPABASE_URL, SUPABASE_ANON_KEY } = process.env;

  const corsHeaders = {
    "Access-Control-Allow-Origin": "*", // Allow all origins for testing
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Authorization, Content-Type",
  };

  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: corsHeaders });
  }

  try {
    console.log("🔎 Fetching from:", `${SUPABASE_URL}/functions/v1/tech-incidents`);

    const response = await fetch(`${SUPABASE_URL}/functions/v1/tech-incidents`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
        "Content-Type": "application/json",
      },
    });

    console.log("📡 Supabase response status:", response.status);

    const data = await response.json();
    console.log("📜 Supabase response body:", data);

    if (!response.ok) {
      console.error("🚨 Supabase Error:", data);
      return new Response(
        JSON.stringify({ error: `Supabase error: ${response.status}`, details: data }),
        { status: response.status, headers: corsHeaders }
      );
    }

    return new Response(JSON.stringify(data), { status: 200, headers: corsHeaders });
  } catch (error) {
    console.error("❌ Fetch Error:", error); // Log error message

    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: corsHeaders,
    });
  }
}
