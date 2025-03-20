"use client";

import { AUTH_ENDPOINTS } from "../config";
import { ERROR_TYPES } from "@/app/utils/errors/errorTypes";

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
      credentials: "include",
      body: JSON.stringify({ email, password }),
    });

    let data;
    try {
      data = await response.json();
    } catch (e) {
      throw new Error("Failed to parse response from server");
    }

    if (!response.ok) {
      // The error is already processed by the API route
      throw data;
    }

    if (!data.user) {
      const error = new Error("Invalid response from authentication server");
      error.type = ERROR_TYPES.INVALID_CREDENTIALS;
      error.details = "The server response did not include user information";
      throw error;
    }

    return data;
  } catch (error) {
    console.warn("Sign in error:", error);
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
      credentials: "include",
      body: JSON.stringify({ email, password, displayName }),
    });

    let data;
    try {
      data = await response.json();
    } catch (e) {
      throw new Error("Failed to parse response from server");
    }

    if (!response.ok) {
      throw data;
    }

    if (!data.user) {
      const error = new Error("Invalid response from authentication server");
      error.type = ERROR_TYPES.SERVICE_UNAVAILABLE;
      error.details = "The server response did not include user information";
      throw error;
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
      return {
        success: true,
        warning: "Offline signout - server session may still be active",
      };
    }

    const response = await fetch(AUTH_ENDPOINTS.SIGNOUT, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
    });

    let data;
    try {
      data = await response.json();
    } catch (e) {
      // Silent fail for signout is acceptable if we get a non-JSON response
      return { success: true };
    }

    if (!response.ok) {
      // If we get an error on signout, we still consider it successful locally
      // but include the warning from the server
      return {
        success: true,
        warning: data.error || "Server signout may have failed",
      };
    }

    return data;
  } catch (error) {
    console.error("Sign out error:", error);

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

    const response = await fetch(AUTH_ENDPOINTS.USER, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
    });

    let data;
    try {
      data = await response.json();
    } catch (e) {
      throw new Error("Failed to parse response from server");
    }

    if (!response.ok) {
      if (response.status === 401) {
        return { user: null, session: null };
      }

      // For other errors, throw the processed error from the API
      throw data;
    }

    if (!data || !data.user) {
      return { user: null, session: null };
    }

    return data;
  } catch (error) {
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
    const response = await fetch(AUTH_ENDPOINTS.PROTECTED, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
    });

    let data;
    try {
      data = await response.json();
    } catch (e) {
      throw new Error("Failed to parse response from server");
    }

    if (!response.ok) {
      throw data;
    }

    return data;
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
    const response = await fetch(AUTH_ENDPOINTS.PROTECTED, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(data),
    });

    let responseData;
    try {
      responseData = await response.json();
    } catch (e) {
      throw new Error("Failed to parse response from server");
    }

    if (!response.ok) {
      throw responseData;
    }

    return responseData;
  } catch (error) {
    console.error("Add protected data error:", error);
    throw error;
  }
}
