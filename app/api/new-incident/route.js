import {
  createEndpointHandler,
  fetchFromSupabase,
} from "@/app/utils/api/apiUtils";

export const POST = createEndpointHandler(async (req) => {
  try {
    const requestData = await req.json();

    if (!requestData.addition) {
      return new Response(JSON.stringify({ error: "Missing incident data" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const incidentData = requestData.addition;

    if (!incidentData.name || !incidentData.name.trim()) {
      return new Response(
        JSON.stringify({ error: "Incident name is required" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    if (!incidentData.incident_date) {
      return new Response(
        JSON.stringify({ error: "Incident date is required" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    const payload = { addition: incidentData };

    if (incidentData.artifactType === "image" && requestData.fileData) {
      payload.fileData = requestData.fileData;
      payload.fileName = requestData.fileName || "unknown.jpg";
      payload.fileType = requestData.fileType || "image/jpeg";

      if (typeof payload.fileData === "string") {
        // Rough size check
        const base64Size = payload.fileData.length * 0.75; // approximate size
        if (base64Size > 5 * 1024 * 1024) {
          // 5MB limit
          return new Response(
            JSON.stringify({ error: "File size exceeds 5MB limit" }),
            { status: 413, headers: { "Content-Type": "application/json" } }
          );
        }
      }
    }

    console.log("📤 Sending new incident to Supabase");

    const data = await fetchFromSupabase("tech-incidents", "POST", payload);

    return new Response(JSON.stringify(data), {
      status: 201,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("New incident error:", error);

    if (error.status === 413) {
      return new Response(JSON.stringify({ error: "File too large" }), {
        status: 413,
        headers: { "Content-Type": "application/json" },
      });
    }

    if (error.status === 403) {
      return new Response(
        JSON.stringify({
          error: "You don't have permission to create incidents",
        }),
        { status: 403, headers: { "Content-Type": "application/json" } }
      );
    }

    if (error.status === 400) {
      return new Response(
        JSON.stringify({ error: error.message || "Invalid incident data" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ error: "Failed to create incident" }),
      {
        status: error.status || 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
});
