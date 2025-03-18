import {
  createEndpointHandler,
  fetchFromSupabase,
} from "@/app/utils/api/apiUtils";
import { cookies } from "next/headers";

export const POST = createEndpointHandler(async (req) => {
  const { email, password } = await req.json();
  const data = await fetchFromSupabase("authentication/signin", "POST", {
    email,
    password,
  });

  if (data.session) {
    const cookieStore = cookies();

    cookieStore.set("sb-access-token", data.session.access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 3600,
      path: "/",
      sameSite: "lax",
    });

    cookieStore.set("sb-refresh-token", data.session.refresh_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 7776000,
      path: "/",
      sameSite: "lax",
    });
  }

  return new Response(
    JSON.stringify({ user: data.user, session: data.session }),
    {
      status: 200,
      headers: { "Content-Type": "application/json" },
    }
  );
});
