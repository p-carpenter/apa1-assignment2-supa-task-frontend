export async function DELETE(req) {
  const { SUPABASE_URL, SUPABASE_ANON_KEY } = process.env;

  try {
    const corsHeaders = {
      "Access-Control-Allow-Methods": "GET, POST, PUT, OPTIONS",
      "Access-Control-Allow-Headers": "Authorization, Content-Type",
    };

    if (req.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: corsHeaders });
    }

    const body = await req.json();
    console.log("Delete request body:", body);

    // Handle both single id and array of ids
    const { id, ids } = body;
    let idsToDelete = [];

    if (id) {
      idsToDelete = [id];
    } else if (ids && Array.isArray(ids)) {
      idsToDelete = ids;
    }

    if (idsToDelete.length === 0) {
      return new Response(
        JSON.stringify({ error: "No valid incident IDs provided" }),
        {
          status: 400,
          headers: corsHeaders,
        }
      );
    }

    const response = await fetch(
      `${SUPABASE_URL}/functions/v1/fetch-incidents`,
      {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ ids: idsToDelete }),
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

    const data = await response.json();
    return new Response(JSON.stringify(data), {
      status: 200,
      headers: corsHeaders,
    });
  } catch (error) {
    const corsHeaders = {
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
