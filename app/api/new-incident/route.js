export async function POST(req) {
  const { SUPABASE_URL, SUPABASE_ANON_KEY } = process.env;

  try {
    const corsHeaders = {
      "Access-Control-Allow-Origin": "*", // testing
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Authorization, Content-Type",
    };

    if (req.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: corsHeaders });
    }

    const requestData = await req.json();
    const incidentData = requestData.addition;

    if (incidentData.incident_date) {
      const parts = incidentData.incident_date.split("/");
      if (parts.length === 3) {
        const isoDate = `${parts[2]}-${parts[1]}-${parts[0]}`;
        incidentData.incident_date = isoDate;
      }
    }

    const payload = {
      addition: incidentData,
    };

    if (incidentData.artifactType === "code") {
    } else if (incidentData.artifactType === "image" && requestData.fileData) {
      payload.fileData = requestData.fileData;
      payload.fileName = requestData.fileName;
      payload.fileType = requestData.fileType;
    }

    console.log(
      "Sending payload to Supabase:",
      JSON.stringify(payload, null, 2)
    );

    const response = await fetch(
      `${SUPABASE_URL}/functions/v1/tech-incidents`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Supabase error: ${response.status}`, errorText);
      return new Response(
        JSON.stringify({
          error: `Supabase error: ${response.status}`,
          details: errorText,
        }),
        { status: 500 }
      );
    }

    const data = await response.json();
    return new Response(JSON.stringify(data), { status: 200 });
  } catch (error) {
    console.error("Error in new-incident route:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
    });
  }
}