import {
  createEndpointHandler,
  fetchFromSupabase,
} from "@/app/utils/api/apiUtils";

export const GET = createEndpointHandler(async () => {
  const data = await fetchFromSupabase("tech-incidents", "GET");
  return new Response(JSON.stringify(data), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
});
