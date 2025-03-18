import {
  createEndpointHandler,
  fetchFromSupabase,
} from "@/app/utils/api/apiUtils";
import { cookies } from "next/headers";

export const POST = createEndpointHandler(async (req) => {
  try {
    // Get cookies even if they might be expired
    const cookieStore = await cookies();
    const accessToken = cookieStore.get("sb-access-token")?.value;
    const refreshToken = cookieStore.get("sb-refresh-token")?.value;

    // Try to sign out from Supabase if we have tokens, but don't let it fail the whole operation
    if (accessToken && refreshToken) {
      try {
        await fetchFromSupabase("authentication/signout", "POST", null, {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
          Cookie: `sb-access-token=${accessToken}; sb-refresh-token=${refreshToken}`,
        });
      } catch (error) {
        // Ignore errors from Supabase signout
        console.log("Supabase signout failed, continuing with cookie removal");
      }
    }

    // Always clear cookies, regardless of Supabase signout success
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

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error in signout:", error);
    // Still return success since we're clearing client state anyway
    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  }
});
