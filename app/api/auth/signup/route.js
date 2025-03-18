import {
  createEndpointHandler,
  fetchFromSupabase,
} from "@/app/utils/api/apiUtils";

export const POST = createEndpointHandler(async (req) => {
  const { email, password, displayName } = await req.json();
  const data = await fetchFromSupabase("authentication/signup", "POST", {
    email,
    password,
    displayName,
  });

  return new Response(JSON.stringify(data), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
});
