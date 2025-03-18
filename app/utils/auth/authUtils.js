"use client";

import { AUTH_STORAGE_KEYS, AUTH_ENDPOINTS } from "./auth-config";

/**
 * Sign in a user with email and password
 * @param {Object} credentials - User credentials with email and password
 * @returns {Promise<Object>} Authentication data with user and session
 */
export async function signIn({ email, password }) {
  try {
    const response = await fetch(AUTH_ENDPOINTS.SIGNIN, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include", // Important for cookies
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Failed to sign in");
    }

    const data = await response.json();

    // Store in localStorage for persistence
    if (data.user) {
      localStorage.setItem(AUTH_STORAGE_KEYS.USER, JSON.stringify(data.user));
    }
    if (data.session?.access_token) {
      localStorage.setItem(AUTH_STORAGE_KEYS.TOKEN, data.session.access_token);
    }

    return data;
  } catch (error) {
    console.error("Sign in error:", error);
    throw error;
  }
}

/**
 * Sign up a new user with email and password
 * @param {Object} credentials - User signup data with email, password, and displayName
 * @returns {Promise<Object>} Authentication data with user and session
 */
export async function signUp({ email, password, displayName }) {
  try {
    const response = await fetch(AUTH_ENDPOINTS.SIGNUP, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include", // Important for cookies
      body: JSON.stringify({ email, password, displayName }),
    });

    const data = await response.json();

    if (!response.ok) {
      if (data.error === "User already exists") {
        throw new Error(
          "An account with this email already exists. Please log in instead."
        );
      }
      throw new Error(data.error || "Failed to sign up");
    }

    // Store in localStorage for persistence
    if (data.user) {
      localStorage.setItem(AUTH_STORAGE_KEYS.USER, JSON.stringify(data.user));
    }
    if (data.session?.access_token) {
      localStorage.setItem(AUTH_STORAGE_KEYS.TOKEN, data.session.access_token);
    }

    return data;
  } catch (error) {
    console.error("Sign up error:", error);
    throw error;
  }
}

/**
 * Sign out the current user
 * @returns {Promise<Object>} Response from the server
 */
export async function signOut() {
  try {
    const response = await fetch(AUTH_ENDPOINTS.SIGNOUT, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include", // Important for cookies
    });

    // Clear localStorage regardless of response
    localStorage.removeItem(AUTH_STORAGE_KEYS.USER);
    localStorage.removeItem(AUTH_STORAGE_KEYS.TOKEN);

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Failed to sign out");
    }

    return await response.json();
  } catch (error) {
    console.error("Sign out error:", error);
    throw error;
  }
}

/**
 * Get the current user from localStorage without server verification
 * @returns {Object|null} User data or null
 */
export function getStoredUser() {
  if (typeof window === "undefined") return null;

  const storedUser = localStorage.getItem(AUTH_STORAGE_KEYS.USER);
  if (!storedUser) return null;

  try {
    return {
      user: JSON.parse(storedUser),
      session: {
        token: localStorage.getItem(AUTH_STORAGE_KEYS.TOKEN) || null,
      },
    };
  } catch (e) {
    console.error("Error parsing stored user:", e);
    return null;
  }
}

/**
 * Get the current user
 * Only verifies with server if forceRefresh is true
 * @param {boolean} forceRefresh - Force server verification
 * @returns {Promise<Object>} Authentication data with user and session
 */
export async function getCurrentUser(forceRefresh = false) {
  // First check localStorage
  const storedData = getStoredUser();

  // If we have stored data and don't need to refresh, return it immediately
  if (storedData?.user && !forceRefresh) {
    return storedData;
  }

  // Otherwise verify with the server
  try {
    const response = await fetch(AUTH_ENDPOINTS.USER, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
      credentials: "include", // Important for cookies
    });

    if (!response.ok) {
      // If unauthorized, clear localStorage as well
      if (response.status === 401) {
        localStorage.removeItem(AUTH_STORAGE_KEYS.USER);
        localStorage.removeItem(AUTH_STORAGE_KEYS.TOKEN);
      }
      return { user: null, session: null };
    }

    // Server authentication successful
    const data = await response.json();

    // Update localStorage with fresh data
    if (data.user) {
      localStorage.setItem(AUTH_STORAGE_KEYS.USER, JSON.stringify(data.user));
    }
    if (data.session?.access_token) {
      localStorage.setItem(AUTH_STORAGE_KEYS.TOKEN, data.session.access_token);
    }

    return data;
  } catch (error) {
    console.error("Get user error:", error);

    // On network error, fall back to localStorage if available,
    // but mark session as needing refresh
    if (storedData) {
      return {
        ...storedData,
        session: {
          ...storedData.session,
          needs_refresh: true,
        },
      };
    }

    return { user: null, session: null };
  }
}

/**
 * Fetch protected user data
 * @returns {Promise<Object|null>} Protected data or null if unauthorized
 */
export async function getProtectedData() {
  try {
    const response = await fetch(AUTH_ENDPOINTS.PROTECTED, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
      credentials: "include", // Important for cookies
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Failed to fetch protected data");
    }

    return await response.json();
  } catch (error) {
    console.error("Protected data error:", error);
    return null;
  }
}

/**
 * Send data to protected endpoint
 * @param {Object} data - Data to send to the protected endpoint
 * @returns {Promise<Object>} Response from the server
 */
export async function addProtectedData(data) {
  try {
    const response = await fetch(AUTH_ENDPOINTS.PROTECTED, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include", // Important for cookies
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Failed to add data");
    }

    return await response.json();
  } catch (error) {
    console.error("Add protected data error:", error);
    throw error;
  }
}
