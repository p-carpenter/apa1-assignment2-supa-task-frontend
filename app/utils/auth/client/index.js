"use client";

import { AUTH_ENDPOINTS } from "../config";
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
      // If offline, inform about uncleared server session
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

      return response;
    } catch (error) {
      // For network or timeout errors, consider it a success with warning
      if (
        error.type === ERROR_TYPES.NETWORK_ERROR ||
        error.type === ERROR_TYPES.TIMEOUT
      ) {
        return {
          success: true,
          warning: `${error.type} during signout, but you have been signed out locally`,
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
 * Get the current user
 * @param {boolean} forceRefresh - Force server verification
 * @returns {Promise<Object>} Authentication data with user and session
 */
export async function getCurrentUser(forceRefresh = false) {
  try {
    if (typeof window !== "undefined" && !window.navigator.onLine) {
      const offlineError = new Error(
        "No internet connection. Authentication status cannot be verified."
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
      return { user: null, session: null };
    }

    return data;
  } catch (error) {
    console.error("Get user error:", error);

    // Handle auth errors
    if (
      error.type === ERROR_TYPES.AUTH_REQUIRED ||
      error.type === ERROR_TYPES.SESSION_EXPIRED ||
      error.type === ERROR_TYPES.PERMISSION_DENIED
    ) {
      return {
        user: null,
        session: null,
        error: error.message,
      };
    }

    // For network or service unavailable errors, return null with error info
    return {
      user: null,
      session: null,
      error: error.message,
      errorType: error.type,
    };
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
