export async function PUT(req) {
  const { SUPABASE_URL, SUPABASE_ANON_KEY } = process.env;

  try {
    const corsHeaders = {
      "Access-Control-Allow-Origin": "*", // Allow all origins for testing
      "Access-Control-Allow-Methods": "GET, POST, PUT, OPTIONS",
      "Access-Control-Allow-Headers": "Authorization, Content-Type",
    };

    if (req.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: corsHeaders });
    }

    const body = await req.json();
    console.log("Update request body:", body);

    // Extract the id and update data
    const { id, update } = body;

    if (!id) {
      return new Response(
        JSON.stringify({ error: "Incident ID is required" }),
        {
          status: 400,
          headers: corsHeaders,
        }
      );
    }

    // Create the payload with the necessary data
    const payload = { id, update };

    if (update.artifactType === "image" && body.fileData) {
      payload.fileData = body.fileData;
      payload.fileName = body.fileName;
      payload.fileType = body.fileType;
    }

    // Forward the request to Supabase Edge Function
    const response = await fetch(
      `${SUPABASE_URL}/functions/v1/tech-incidents`,
      {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      }
    );

    if (!response.ok) {
      console.error("Supabase update error:", response.status);
      return new Response(
        JSON.stringify({ error: `Supabase error: ${response.status}` }),
        {
          status: 500,
          headers: corsHeaders,
        }
      );
    }

    // Get updated data and return it
    const data = await response.json();
    return new Response(JSON.stringify(data), {
      status: 200,
      headers: corsHeaders,
    });
  } catch (error) {
    const corsHeaders = {
      "Access-Control-Allow-Origin": "*", // Allow all origins for testing
      "Access-Control-Allow-Methods": "GET, POST, PUT, OPTIONS",
      "Access-Control-Allow-Headers": "Authorization, Content-Type",
    };
    
    console.error("Update error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: corsHeaders,
    });
  }
}
