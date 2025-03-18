import { withAuth } from "@/app/utils/api/authMiddleware";
import {
  createEndpointHandler,
  fetchFromSupabase,
} from "@/app/utils/api/apiUtils";
import { cookies } from "next/headers";

export const POST = createEndpointHandler(
  withAuth(async (req) => {
    await fetchFromSupabase(
      "authentication/signout",
      "POST",
      null,
      getSupabaseAuthHeaders(req)
    );

    const cookieStore = cookies();
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
  })
);
