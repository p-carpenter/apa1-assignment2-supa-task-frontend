import { NextResponse } from "next/server";
import { getServerSession } from "../../../utils/auth/server";

export async function GET() {
  try {
    const { user, session } = await getServerSession();

    if (!user) {
      return NextResponse.json(
        {
          error: "No active session found",
          type: "auth_required",
          message: "Authentication required to access this resource",
        },
        { status: 401 }
      );
    }

    return NextResponse.json({ user, session });
  } catch (error) {
    console.error("User fetch error:", error);
    return NextResponse.json(
      {
        error: "Error fetching user data",
        type: "service_error",
        message: "Failed to verify authentication status",
      },
      { status: 500 }
    );
  }
}
