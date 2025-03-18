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

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Failed to sign up");
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
 * Get the current user
 * @returns {Promise<Object>} Authentication data with user and session
 */
export async function getCurrentUser() {
  try {
    // First check localStorage for user data
    const storedUser = localStorage.getItem(AUTH_STORAGE_KEYS.USER);
    const storedToken = localStorage.getItem(AUTH_STORAGE_KEYS.TOKEN);
    const localData = storedUser ? { user: JSON.parse(storedUser) } : null;

    // Then verify with the server
    const response = await fetch(AUTH_ENDPOINTS.USER, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
      credentials: "include", // Important for cookies
    });

    if (!response.ok) {
      if (response.status === 401) {
        // If server rejects the auth, but we have localStorage data
        // Return the local data with a flag indicating refresh needed
        if (localData) {
          return {
            user: localData.user,
            session: {
              needs_refresh: true,
              token: storedToken,
            },
          };
        }
        return { user: null, session: null };
      }
      const error = await response.json();
      throw new Error(error.error || "Failed to get user");
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

    // On network error, fall back to localStorage if available
    const storedUser = localStorage.getItem(AUTH_STORAGE_KEYS.USER);
    const storedToken = localStorage.getItem(AUTH_STORAGE_KEYS.TOKEN);

    if (storedUser) {
      return {
        user: JSON.parse(storedUser),
        session: {
          needs_refresh: true,
          token: storedToken,
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
