"use client";

import { AUTH_ENDPOINTS } from "../config";
import { ERROR_TYPES } from "@/app/utils/errors/errorTypes";

/**
 * Sign in a user with email and password
 * 
 * @param {Object} credentials - User credentials 
 * @param {string} credentials.email - User's email
 * @param {string} credentials.password - User's password
 * @returns {Promise<Object>} Authentication data with user and session
 * @throws {Object} Standardized error object
 */
export async function signIn({ email, password }) {
  try {
    const response = await fetchWithCredentials(AUTH_ENDPOINTS.SIGNIN, "POST", { 
      email, 
      password 
    });
    
    const data = await parseJsonResponse(response, "Failed to parse sign-in response");
    
    if (!response.ok) {
      // The error is already processed by the API route
      throw data;
    }

    validateUserData(data);
    return data;
  } catch (error) {
    console.warn("Sign in error:", error);
    throw error;
  }
}

/**
 * Sign up a new user with email and password
 * 
 * @param {Object} credentials - User signup data
 * @param {string} credentials.email - User's email
 * @param {string} credentials.password - User's password
 * @param {string} [credentials.displayName] - User's display name
 * @returns {Promise<Object>} Authentication data with user and session
 * @throws {Object} Standardized error object
 */
export async function signUp({ email, password, displayName }) {
  try {
    const response = await fetchWithCredentials(AUTH_ENDPOINTS.SIGNUP, "POST", { 
      email, 
      password, 
      displayName 
    });
    
    const data = await parseJsonResponse(response, "Failed to parse sign-up response");
    
    if (!response.ok) {
      throw data;
    }

    validateUserData(data);
    return data;
  } catch (error) {
    console.warn("Sign up error:", error);
    throw error;
  }
}

/**
 * Sign out the current user
 * 
 * @returns {Promise<Object>} Response from the server
 * @throws {Object} Standardized error object (except for network errors)
 */
export async function signOut() {
  try {
    if (isOffline()) {
      return createOfflineSignoutResponse();
    }

    const response = await fetchWithCredentials(AUTH_ENDPOINTS.SIGNOUT, "POST");
    
    // Handle response, with silent failure for non-JSON responses
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

    if (isNetworkError(error)) {
      return createNetworkErrorSignoutResponse(error);
    }

    throw error;
  }
}

/**
 * Get the current user
 * 
 * @param {boolean} [forceRefresh=false] - Force a refresh from the server
 * @returns {Promise<Object>} Authentication data with user and session
 * @throws {Object} Standardized error object
 */
export async function getCurrentUser(forceRefresh = false) {
  try {
    if (isOffline()) {
      return handleOfflineUserCheck();
    }

    const response = await fetchWithCredentials(AUTH_ENDPOINTS.USER, "GET");
    
    const data = await parseJsonResponse(response, "Failed to parse user response");
    
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
      type: error.type,
    };
  }
}

/**
 * Fetch protected user data
 * 
 * @returns {Promise<Object|null>} Protected data or null if unauthorized
 */
export async function getProtectedData() {
  try {
    const response = await fetchWithCredentials(AUTH_ENDPOINTS.PROTECTED, "GET");
    
    const data = await parseJsonResponse(response, "Failed to parse protected data response");
    
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
 * 
 * @param {Object} data - Data to send to the protected endpoint
 * @returns {Promise<Object>} Response from the server
 * @throws {Object} Standardized error object
 */
export async function addProtectedData(data) {
  validateProtectedData(data);

  try {
    const response = await fetchWithCredentials(AUTH_ENDPOINTS.PROTECTED, "POST", data);
    
    const responseData = await parseJsonResponse(response, "Failed to parse add protected data response");
    
    if (!response.ok) {
      throw responseData;
    }

    return responseData;
  } catch (error) {
    console.error("Add protected data error:", error);
    throw error;
  }
}

/**
 * Request a password reset email
 * 
 * @param {Object} params - Password reset parameters
 * @param {string} params.email - User's email address
 * @returns {Promise<Object>} Response from the server
 * @throws {Object} Standardized error object
 */
export async function resetPassword({ email }) {
  try {
    const response = await fetch(AUTH_ENDPOINTS.PASSWORD_RECOVERY, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
    
    const data = await parseJsonResponse(response, "Failed to parse password reset response");
    
    if (!response.ok) {
      throw data;
    }

    return data;
  } catch (error) {
    console.warn("Password reset error:", error);
    throw error;
  }
}

/**
 * Confirm password reset with token, email and new password
 * 
 * @param {Object} params - Password reset confirmation parameters
 * @param {string} params.email - User's email address
 * @param {string} params.password - New password
 * @param {string} params.token - Reset token from email
 * @returns {Promise<Object>} Response from the server
 * @throws {Object} Standardized error object
 */
export async function resetPasswordConfirm({ email, password, token }) {
  try {
    const response = await fetch(AUTH_ENDPOINTS.PASSWORD_RECOVERY_CONFIRM, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password, token }),
    });
    
    const data = await parseJsonResponse(response, "Failed to parse password reset confirmation response");
    
    if (!response.ok) {
      throw data;
    }

    return data;
  } catch (error) {
    console.warn("Password reset confirmation error:", error);
    throw error;
  }
}

/**
 * Performs a fetch request with authentication credentials
 * 
 * @param {string} url - URL to fetch
 * @param {string} method - HTTP method
 * @param {Object} [body] - Optional request body
 * @returns {Promise<Response>} Fetch response
 */
async function fetchWithCredentials(url, method, body = null) {
  return fetch(url, {
    method,
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    ...(body && { body: JSON.stringify(body) }),
  });
}

/**
 * Parses a JSON response, handling parse failures
 * 
 * @param {Response} response - Fetch response
 * @param {string} errorMessage - Error message if parsing fails
 * @returns {Promise<Object>} Parsed JSON data
 * @throws {Error} Parse error
 */
async function parseJsonResponse(response, errorMessage) {
  try {
    return await response.json();
  } catch (e) {
    throw new Error(errorMessage);
  }
}

/**
 * Validates that user data contains required properties
 * 
 * @param {Object} data - User data to validate
 * @throws {Object} Standardized error object if validation fails
 */
function validateUserData(data) {
  if (!data.user) {
    const error = new Error("Invalid response from authentication server");
    error.type = ERROR_TYPES.INVALID_CREDENTIALS;
    error.details = "The server response did not include user information";
    throw error;
  }
}

/**
 * Validates data before sending to protected endpoints
 * 
 * @param {Object} data - Data to validate
 * @throws {Object} Standardized error object if validation fails
 */
function validateProtectedData(data) {
  if (!data || typeof data !== "object") {
    const validationError = new Error("Invalid data. Expected an object.");
    validationError.type = ERROR_TYPES.BAD_REQUEST;
    throw validationError;
  }
}

/**
 * Checks if the client is offline
 * 
 * @returns {boolean} True if offline
 */
function isOffline() {
  return typeof window !== "undefined" && !window.navigator.onLine;
}

/**
 * Creates a response for offline signout
 * 
 * @returns {Object} Offline signout response
 */
function createOfflineSignoutResponse() {
  return {
    success: true,
    warning: "Offline signout - server session may still be active",
  };
}

/**
 * Creates a response for network error during signout
 * 
 * @param {Object} error - The network error
 * @returns {Object} Network error signout response
 */
function createNetworkErrorSignoutResponse(error) {
  return {
    success: true,
    warning: `${error.type} during signout, but you have been signed out locally`,
  };
}

/**
 * Checks if an error is a network-related error
 * 
 * @param {Object} error - Error to check
 * @returns {boolean} True if it's a network error
 */
function isNetworkError(error) {
  return (
    error.type === ERROR_TYPES.NETWORK_ERROR ||
    error.type === ERROR_TYPES.TIMEOUT
  );
}

/**
 * Handles offline user check
 * 
 * @returns {Object} User check response for offline case
 */
function handleOfflineUserCheck() {
  const offlineError = new Error(
    "No internet connection. Authentication status cannot be verified."
  );
  offlineError.type = ERROR_TYPES.NETWORK_ERROR;
  offlineError.isOffline = true;
  console.warn("Offline user check:", offlineError);
  
  return {
    user: null,
    session: null,
    error: offlineError.message,
    type: offlineError.type,
  };
}
