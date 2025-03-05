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

    const formData = await req.formData();

    // Basic incident data
    const incidentData = {
      name: formData.get("name"),
      incident_date: formData.get("incident_date"),
      category: formData.get("category"),
      severity: formData.get("severity"),
      description: formData.get("description"),
      cause: formData.get("cause"),
      consequences: formData.get("consequences"),
      time_to_resolve: formData.get("time_to_resolve"),
      artifactType: formData.get("artifactType") || "none",
      artifactContent: formData.get("artifactContent") || null,
    };

    // Convert date if needed
    if (incidentData.incident_date) {
      const parts = incidentData.incident_date.split("/");
      if (parts.length === 3) {
        // Convert from DD/MM/YYYY to YYYY-MM-DD
        const isoDate = `${parts[2]}-${parts[1]}-${parts[0]}`;
        incidentData.incident_date = isoDate;
      }
    }

    // Structure payload to exactly match what the edge function expects
    const payload = {
      addition: incidentData,
    };

    // Handle different artifact types
    if (payload.artifactType === "code") {
      payload.artifactContent = formData.get("artifactContent") || "";
    } else if (payload.artifactType === "image") {
      const file = formData.get("file");
      if (file) {
        const arrayBuffer = await file.arrayBuffer();
        const buffer = new Uint8Array(arrayBuffer);

        // Process larger files in chunks
        const chunks = [];
        const chunkSize = 1024;
        for (let i = 0; i < buffer.length; i += chunkSize) {
          chunks.push(
            String.fromCharCode.apply(null, buffer.subarray(i, i + chunkSize))
          );
        }
        const base64 = btoa(chunks.join(""));

        payload.fileData = `data:${file.type};base64,${base64}`;
        payload.fileName = file.name;
        payload.fileType = file.type;
      }
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
