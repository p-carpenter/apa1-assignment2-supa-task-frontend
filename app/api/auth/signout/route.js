import {
  createEndpointHandler,
  fetchFromSupabase,
} from "@/app/utils/api/apiUtils";
import { cookies } from "next/headers";

export const POST = createEndpointHandler(async (req) => {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("sb-access-token")?.value;
  const refreshToken = cookieStore.get("sb-refresh-token")?.value;

  // Always clear cookies regardless of what happens with the API call
  try {
    // Clear cookies
    cookieStore.set("sb-access-token", "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 0,
      path: "/",
      sameSite: "lax",
    });
    cookieStore.set("sb-refresh-token", "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 0,
      path: "/",
      sameSite: "lax",
    });

    // If we have tokens, attempt to sign out from Supabase
    if (accessToken && refreshToken) {
      try {
        await fetchFromSupabase("authentication/signout", "POST", null, {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
          Cookie: `sb-access-token=${accessToken}; sb-refresh-token=${refreshToken}`,
        });
      } catch (error) {
        // Log but don't fail the operation if Supabase signout fails
        console.warn("Supabase signout failed, but cookies have been cleared:", error.message);
      }
    } else {
      console.log("No auth tokens found, skipping Supabase signout");
    }

    return new Response(
      JSON.stringify({ success: true }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error in signout:", error);
    
    // Still return success as we want the frontend to clear its state
    // This avoids UI showing logged in when session is actually invalid
    return new Response(
      JSON.stringify({ 
        success: true,
        warning: "Signout partially completed with errors"
      }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  }
});