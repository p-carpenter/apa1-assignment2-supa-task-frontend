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
 * 
 * @returns {Promise<{user: Object|null, session: Object|null}>} User and session data
 */
export async function getServerSession() {
  const { accessToken, refreshToken } = await getAuthTokensFromCookies();

  if (!accessToken || !refreshToken) {
    return { user: null, session: null };
  }

  try {
    const response = await fetchWithAuthCookies(
      `${EDGE_FUNCTION_BASE_URL}${EDGE_FUNCTIONS.USER}`,
      accessToken,
      refreshToken
    );

    if (!response.ok) {
      return { user: null, session: null };
    }

    return await response.json();
  } catch (error) {
    console.error("Server session error:", error);
    return { user: null, session: null };
  }
}

/**
 * Fetch protected data from server component
 * 
 * @returns {Promise<Object|null>} Protected data or null if unauthorized
 */
export async function getProtectedServerData() {
  const { accessToken, refreshToken } = await getAuthTokensFromCookies();

  if (!accessToken || !refreshToken) {
    return null;
  }

  try {
    const response = await fetchWithAuthCookies(
      `${EDGE_FUNCTION_BASE_URL}${EDGE_FUNCTIONS.VALIDATE}`,
      accessToken,
      refreshToken
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

/**
 * Retrieves authentication tokens from cookies
 * 
 * @returns {Promise<{accessToken: string|undefined, refreshToken: string|undefined}>} Auth tokens
 */
async function getAuthTokensFromCookies() {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get(AUTH_COOKIE_NAMES.ACCESS_TOKEN)?.value;
  const refreshToken = cookieStore.get(AUTH_COOKIE_NAMES.REFRESH_TOKEN)?.value;
  
  return { accessToken, refreshToken };
}

/**
 * Performs a fetch request with authentication cookies
 * 
 * @param {string} url - URL to fetch
 * @param {string} accessToken - Access token
 * @param {string} refreshToken - Refresh token
 * @returns {Promise<Response>} Fetch response
 */
async function fetchWithAuthCookies(url, accessToken, refreshToken) {
  return fetch(url, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Cookie: `${AUTH_COOKIE_NAMES.ACCESS_TOKEN}=${accessToken}; ${AUTH_COOKIE_NAMES.REFRESH_TOKEN}=${refreshToken}`,
      Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
    },
  });
}
