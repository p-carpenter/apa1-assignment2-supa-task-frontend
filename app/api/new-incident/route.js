export async function POST(req) {
  const { SUPABASE_URL, SUPABASE_ANON_KEY } = process.env;

  try {

      const corsHeaders = {
    "Access-Control-Allow-Origin": "*", // Allow all origins for testing
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Authorization, Content-Type",
  };

  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: corsHeaders });
  }

    const body = await req.json();
    console.log("Received body:", body);

    const response = await fetch(`${SUPABASE_URL}/functions/v1/tech-incidents`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      return new Response(JSON.stringify({ error: `Supabase error: ${response.status}` }), { status: 500 });
    }

    const data = await response.json();
    return new Response(JSON.stringify(data), { status: 200 });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
}
