"use client";

import { AUTH_STORAGE_KEYS, AUTH_ENDPOINTS } from "../config";
import { ERROR_TYPES } from "@/app/utils/errors/errorTypes";
import { fetchWithErrorHandling } from "../../api/clientApi";

/**
 * Sign in a user with email and password
 * @param {Object} credentials - User credentials with email and password
 * @returns {Promise<Object>} Authentication data with user and session
 */
export async function signIn({ email, password }) {
  try {
    const data = await fetchWithErrorHandling(
      AUTH_ENDPOINTS.SIGNIN,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email, password }),
      },
      {
        defaultMessage: "Authentication failed",
      }
    );

    if (!data.user) {
      const error = new Error("Invalid response from authentication server");
      error.type = ERROR_TYPES.SERVICE_UNAVAILABLE;
      throw error;
    }

    // Store in localStorage for persistence
    try {
      localStorage.setItem(AUTH_STORAGE_KEYS.USER, JSON.stringify(data.user));
      if (data.session?.access_token) {
        localStorage.setItem(
          AUTH_STORAGE_KEYS.TOKEN,
          data.session.access_token
        );
      }
    } catch (storageError) {
      console.warn(
        "Failed to store authentication in localStorage:",
        storageError
      );
      // Continue anyway as cookies are the primary auth method
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
    const data = await fetchWithErrorHandling(
      AUTH_ENDPOINTS.SIGNUP,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email, password, displayName }),
      },
      {
        defaultMessage: "Failed to sign up",
      }
    );

    if (!data.user) {
      const validationError = new Error(
        "Invalid response from authentication server"
      );
      validationError.type = ERROR_TYPES.SERVICE_UNAVAILABLE;
      throw validationError;
    }

    try {
      localStorage.setItem(AUTH_STORAGE_KEYS.USER, JSON.stringify(data.user));
      if (data.session?.access_token) {
        localStorage.setItem(
          AUTH_STORAGE_KEYS.TOKEN,
          data.session.access_token
        );
      }
    } catch (storageError) {
      console.warn(
        "Failed to store authentication in localStorage:",
        storageError
      );
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
    if (typeof window !== "undefined" && !window.navigator.onLine) {
      // If offline, just clear local state
      localStorage.removeItem(AUTH_STORAGE_KEYS.USER);
      localStorage.removeItem(AUTH_STORAGE_KEYS.TOKEN);
      return {
        success: true,
        warning: "Offline signout - server session may still be active",
      };
    }

    try {
      const response = await fetchWithErrorHandling(
        AUTH_ENDPOINTS.SIGNOUT,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
        },
        {
          defaultMessage: "Failed to sign out on server",
        }
      );

      // Clear local storage regardless of server response
      localStorage.removeItem(AUTH_STORAGE_KEYS.USER);
      localStorage.removeItem(AUTH_STORAGE_KEYS.TOKEN);

      return response;
    } catch (error) {
      localStorage.removeItem(AUTH_STORAGE_KEYS.USER);
      localStorage.removeItem(AUTH_STORAGE_KEYS.TOKEN);

      // For network or timeout errors, consider it a success with warning
      if (
        error.type === ERROR_TYPES.NETWORK_ERROR ||
        error.type === ERROR_TYPES.TIMEOUT
      ) {
        return {
          success: true,
          warning: `${error.type} during signout, but local state has been cleared`,
        };
      }

      throw error;
    }
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

  try {
    const storedUser = localStorage.getItem(AUTH_STORAGE_KEYS.USER);
    if (!storedUser) return null;

    const user = JSON.parse(storedUser);
    const token = localStorage.getItem(AUTH_STORAGE_KEYS.TOKEN);

    // Basic validation of stored user data
    if (!user || typeof user !== "object" || !user.id) {
      console.warn("Invalid user data in localStorage, clearing");
      localStorage.removeItem(AUTH_STORAGE_KEYS.USER);
      localStorage.removeItem(AUTH_STORAGE_KEYS.TOKEN);
      return null;
    }

    return {
      user,
      session: {
        token: token || null,
      },
    };
  } catch (e) {
    console.error("Error parsing stored user:", e);
    localStorage.removeItem(AUTH_STORAGE_KEYS.USER);
    localStorage.removeItem(AUTH_STORAGE_KEYS.TOKEN);
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
  // Check localStorage
  const storedData = getStoredUser();

  if (storedData?.user && !forceRefresh) {
    return storedData;
  }

  try {
    if (typeof window !== "undefined" && !window.navigator.onLine) {
      // Return stored data with warning if offline
      if (storedData) {
        return {
          ...storedData,
          session: {
            ...storedData.session,
            warning: "Offline mode - using stored credentials",
          },
        };
      }

      const offlineError = new Error(
        "No internet connection and no stored user data"
      );
      offlineError.type = ERROR_TYPES.NETWORK_ERROR;
      offlineError.isOffline = true;
      throw offlineError;
    }

    const data = await fetchWithErrorHandling(
      AUTH_ENDPOINTS.USER,
      {
        method: "GET",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      },
      {
        defaultMessage: "Failed to verify authentication",
      }
    );

    if (!data || !data.user) {
      // Clear localStorage here to ensure consistency
      localStorage.removeItem(AUTH_STORAGE_KEYS.USER);
      localStorage.removeItem(AUTH_STORAGE_KEYS.TOKEN);

      return { user: null, session: null };
    }

    // Update localStorage with fresh data
    try {
      localStorage.setItem(AUTH_STORAGE_KEYS.USER, JSON.stringify(data.user));
      if (data.session?.access_token) {
        localStorage.setItem(
          AUTH_STORAGE_KEYS.TOKEN,
          data.session.access_token
        );
      }
    } catch (storageError) {
      console.warn(
        "Failed to update localStorage with fresh user data:",
        storageError
      );
    }

    return data;
  } catch (error) {
    console.error("Get user error:", error);

    // Handle auth errors by clearing localStorage to ensure consistency
    if (
      error.type === ERROR_TYPES.AUTH_REQUIRED ||
      error.type === ERROR_TYPES.SESSION_EXPIRED ||
      error.type === ERROR_TYPES.PERMISSION_DENIED
    ) {
      localStorage.removeItem(AUTH_STORAGE_KEYS.USER);
      localStorage.removeItem(AUTH_STORAGE_KEYS.TOKEN);

      return {
        user: null,
        session: null,
        error: error.message,
      };
    }

    if (error.type === ERROR_TYPES.SERVICE_UNAVAILABLE && storedData) {
      return {
        ...storedData,
        session: {
          ...storedData.session,
          needs_refresh: true,
          warning: "Server error - using stored credentials",
        },
      };
    }

    // For timeouts, fall back to stored data with warning
    if (
      (error.type === ERROR_TYPES.TIMEOUT ||
        error.type === ERROR_TYPES.NETWORK_ERROR) &&
      storedData
    ) {
      return {
        ...storedData,
        session: {
          ...storedData.session,
          needs_refresh: true,
          warning: `${error.type} - using stored credentials`,
        },
      };
    }

    // If we have stored data for other errors, return it with warning
    if (storedData) {
      return {
        ...storedData,
        session: {
          ...storedData.session,
          needs_refresh: true,
          warning:
            "Error during authentication check - using stored credentials",
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
    return await fetchWithErrorHandling(
      AUTH_ENDPOINTS.PROTECTED,
      {
        method: "GET",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      },
      {
        defaultMessage: "Failed to fetch protected data",
      }
    );
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
  if (!data || typeof data !== "object") {
    const validationError = new Error("Invalid data. Expected an object.");
    validationError.type = ERROR_TYPES.VALIDATION_ERROR;
    throw validationError;
  }

  try {
    return await fetchWithErrorHandling(
      AUTH_ENDPOINTS.PROTECTED,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(data),
      },
      {
        defaultMessage: "Failed to add data",
      }
    );
  } catch (error) {
    console.error("Add protected data error:", error);
    throw error;
  }
}
