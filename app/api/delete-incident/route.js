import {
  createEndpointHandler,
  fetchFromSupabase,
} from "@/app/utils/api/clientApi";

export const DELETE = createEndpointHandler(async (req) => {
  try {
    const body = await req.json();

    if (!body.ids) {
      return new Response(
        JSON.stringify({ error: "Incident IDs are required" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    const { ids } = body;

    if (!Array.isArray(ids) || ids.length === 0) {
      return new Response(
        JSON.stringify({ error: "No valid incident IDs provided" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // Validate that all IDs are in the correct format
    const validIds = ids.every(
      (id) => typeof id === "string" || typeof id === "number"
    );
    if (!validIds) {
      return new Response(
        JSON.stringify({ error: "Invalid ID format in the provided list" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    console.log(`🗑 Attempting to delete ${ids.length} incidents:`, ids);

    const data = await fetchFromSupabase("tech-incidents", "DELETE", { ids });

    return new Response(JSON.stringify(data), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Delete incident error:", error);

    if (error.status === 404) {
      return new Response(
        JSON.stringify({ error: "One or more incidents not found" }),
        { status: 404, headers: { "Content-Type": "application/json" } }
      );
    }

    if (error.status === 403) {
      return new Response(
        JSON.stringify({
          error: "You don't have permission to delete these incidents",
        }),
        { status: 403, headers: { "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ error: "Failed to delete incidents" }),
      {
        status: error.status || 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
});
