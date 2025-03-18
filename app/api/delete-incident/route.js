import {
  createEndpointHandler,
  fetchFromSupabase,
} from "@/app/utils/api/apiUtils";

export const DELETE = createEndpointHandler(async (req) => {
  const { ids } = await req.json();

  if (!ids || !Array.isArray(ids) || ids.length === 0) {
    return new Response(
      JSON.stringify({ error: "No valid incident IDs provided" }),
      {
        status: 400,
        headers: { "Content-Type": "application/json" },
      }
    );
  }

  console.log(`🗑 Attempting to delete ${ids.length} incidents:`, ids);

  const data = await fetchFromSupabase("tech-incidents", "DELETE", { ids });
  return new Response(JSON.stringify(data), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
});
