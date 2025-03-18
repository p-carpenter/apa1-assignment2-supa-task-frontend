import {
  createEndpointHandler,
  fetchFromSupabase,
} from "@/app/utils/api/apiUtils";

export const GET = createEndpointHandler(async (req) => {
  try {
    // Extract any query params if needed
    const url = new URL(req.url);
    const limit = url.searchParams.get("limit");
    const offset = url.searchParams.get("offset");
    const category = url.searchParams.get("category");
    
    // Construct API path with any params
    let path = "tech-incidents";
    const queryParams = new URLSearchParams();
    
    if (limit) queryParams.append("limit", limit);
    if (offset) queryParams.append("offset", offset);
    if (category) queryParams.append("category", category);
    
    const queryString = queryParams.toString();
    if (queryString) {
      path += `?${queryString}`;
    }
    
    const data = await fetchFromSupabase(path, "GET");
    
    if (!data || !Array.isArray(data)) {
      return new Response(
        JSON.stringify({ error: "Invalid response format from server" }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }
    
    return new Response(
      JSON.stringify(data), 
      { 
        status: 200, 
        headers: { 
          "Content-Type": "application/json",
          "Cache-Control": "max-age=60, stale-while-revalidate=300" 
        } 
      }
    );
  } catch (error) {
    console.error("Fetch incidents error:", error);
    
    if (error.status === 404) {
      return new Response(
        JSON.stringify({ error: "Incidents resource not found" }),
        { status: 404, headers: { "Content-Type": "application/json" } }
      );
    }
    
    return new Response(
      JSON.stringify({ error: "Failed to fetch incidents" }),
      { status: error.status || 500, headers: { "Content-Type": "application/json" } }
    );
  }
});