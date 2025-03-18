import {
  createEndpointHandler,
  fetchFromSupabase,
} from "@/app/utils/api/apiUtils";

export const POST = createEndpointHandler(async (req) => {
  const { email, password, token } = await req.json();

  if (!email || !password || !token) {
    return new Response(
      JSON.stringify({ error: "Email, password, and token are required" }),
      {
        status: 400,
        headers: { "Content-Type": "application/json" },
      }
    );
  }

  const cleanedToken = token.includes("access_token")
    ? token.split("=")[1]
    : token;
  await fetchFromSupabase("password-recovery/confirm", "POST", {
    email,
    password,
    token: cleanedToken,
  });

  return new Response(
    JSON.stringify({ message: "Password has been reset successfully" }),
    {
      status: 200,
      headers: { "Content-Type": "application/json" },
    }
  );
});
