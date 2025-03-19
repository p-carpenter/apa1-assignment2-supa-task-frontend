"use server";

import { cookies } from "next/headers";
import { AUTH_COOKIE_NAMES, EDGE_FUNCTIONS } from "../config";

/**
 * Server-side authentication utilities
 * Functions that can only run on the server and handle server-side auth operations
 */

const { SUPABASE_URL, SUPABASE_ANON_KEY } = process.env;
const EDGE_FUNCTION_BASE_URL = `${SUPABASE_URL}/functions/v1`;

/**
 * Get the current user and session from server
 * @returns {Promise<{user: Object|null, session: Object|null}>} User and session data
 */
export async function getServerSession() {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get(AUTH_COOKIE_NAMES.ACCESS_TOKEN)?.value;
  const refreshToken = cookieStore.get(AUTH_COOKIE_NAMES.REFRESH_TOKEN)?.value;

  if (!accessToken || !refreshToken) {
    return { user: null, session: null };
  }

  try {
    const response = await fetch(
      `${EDGE_FUNCTION_BASE_URL}${EDGE_FUNCTIONS.USER}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Cookie: `${AUTH_COOKIE_NAMES.ACCESS_TOKEN}=${accessToken}; ${AUTH_COOKIE_NAMES.REFRESH_TOKEN}=${refreshToken}`,
          Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
        },
      }
    );

    if (!response.ok) {
      console.error("Server auth error: HTTP status", response.status);
      return { user: null, session: null };
    }

    return await response.json();
  } catch (error) {
    console.error("Server auth error:", error);
    return { user: null, session: null };
  }
}

/**
 * Fetch protected data from server component
 * @returns {Promise<Object|null>} Protected data or null if unauthorized
 */
export async function getProtectedServerData() {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get(AUTH_COOKIE_NAMES.ACCESS_TOKEN)?.value;
  const refreshToken = cookieStore.get(AUTH_COOKIE_NAMES.REFRESH_TOKEN)?.value;

  if (!accessToken || !refreshToken) {
    return null;
  }

  try {
    const response = await fetch(
      `${EDGE_FUNCTION_BASE_URL}${EDGE_FUNCTIONS.VALIDATE}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Cookie: `${AUTH_COOKIE_NAMES.ACCESS_TOKEN}=${accessToken}; ${AUTH_COOKIE_NAMES.REFRESH_TOKEN}=${refreshToken}`,
          Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
        },
      }
    );

    if (!response.ok) {
      return null;
    }

    return await response.json();
  } catch (error) {
    console.error("Protected server data error:", error);
    return null;
  }
}
