import {
  createEndpointHandler,
  fetchFromSupabase,
} from "@/app/utils/api/apiUtils";

export const POST = createEndpointHandler(async (req) => {
  const { email } = await req.json();

  if (!email) {
    return new Response(JSON.stringify({ error: "Email is required" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  await fetchFromSupabase("password-recovery", "POST", { email });

  return new Response(
    JSON.stringify({ message: "Password reset instructions sent" }),
    {
      status: 200,
      headers: { "Content-Type": "application/json" },
    }
  );
});
