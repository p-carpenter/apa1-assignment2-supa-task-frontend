import {
  createEndpointHandler,
  fetchFromSupabase,
} from "@/app/utils/api/apiUtils";

export const POST = createEndpointHandler(async (req) => {
  const { email, password, displayName } = await req.json();
  try {
    const data = await fetchFromSupabase("authentication/signup", "POST", {
      email,
      password,
      displayName,
    });

    // Check for existing user response from Supabase: user exists but identities array is empty and no session
    if (
      data.user &&
      Array.isArray(data.user.identities) &&
      data.user.identities.length === 0 &&
      !data.session
    ) {
      return new Response(
        JSON.stringify({
          error: "User already exists",
          message:
            "An account with this email already exists. Please log in instead.",
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    return new Response(JSON.stringify(data), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error in signup route:", error);
    return new Response(
      JSON.stringify({
        error: error.message || "Sign up failed",
        message: "Unable to create account. Please try again later.",
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
});
