export async function POST(request) {
  try {
    const { email, password, token } = await request.json();

    if (!email || !password || !token) {
      return new Response(
        JSON.stringify({
          error: "Email, password, and token are required",
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Call the Supabase Edge Function to confirm password reset
    const response = await fetch(
      `${process.env.SUPABASE_URL}/functions/v1/password-recovery/confirm`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify({ 
          email, 
          password, 
          token: token.includes("access_token") ? token.split("=")[1] : token 
        }),
      }
    );

    if (!response.ok) {
      const error = await response.json();
      return new Response(
        JSON.stringify({
          error: error.error || "Failed to reset password",
        }),
        {
          status: response.status,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Return success response
    return new Response(
      JSON.stringify({ message: "Password has been reset successfully" }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Password reset confirmation error:", error);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}