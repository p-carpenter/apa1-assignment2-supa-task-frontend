"use client";

import { AUTH_STORAGE_KEYS, AUTH_ENDPOINTS } from "./auth-config";
import { ERROR_TYPES } from "../api/errors/errorHandling";

/**
 * Sign in a user with email and password
 * @param {Object} credentials - User credentials with email and password
 * @returns {Promise<Object>} Authentication data with user and session
 */
export async function signIn({ email, password }) {
  if (!email || !email.trim()) {
    const error = new Error("Email is required");
    error.type = ERROR_TYPES.VALIDATION_ERROR;
    throw error;
  }

  if (!password || !password.trim()) {
    const error = new Error("Password is required");
    error.type = ERROR_TYPES.VALIDATION_ERROR;
    throw error;
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    const error = new Error("Please enter a valid email address");
    error.type = ERROR_TYPES.VALIDATION_ERROR;
    throw error;
  }

  try {
    // Network connectivity check
    if (typeof window !== "undefined" && !window.navigator.onLine) {
      const offlineError = new Error(
        "No internet connection. Please check your network and try again."
      );
      offlineError.type = ERROR_TYPES.NETWORK_ERROR;
      offlineError.isOffline = true;
      throw offlineError;
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000);

    const response = await fetch(AUTH_ENDPOINTS.SIGNIN, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ email, password }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    // Handle authentication-specific error codes
    if (!response.ok) {
      let errorData;
      try {
        errorData = await response.json();
      } catch (e) {
        errorData = { error: `Error: ${response.status}` };
      }

      const error = new Error(
        errorData.error || "Authentication failed"
      );
      error.status = response.status;

      switch (response.status) {
        case 400:
          error.type = ERROR_TYPES.VALIDATION_ERROR;
          error.message = errorData.error || "Invalid login request. Please check your credentials.";
          break;
        case 401:
          error.type = ERROR_TYPES.INVALID_CREDENTIALS;
          error.message = "Invalid email or password. Please try again.";
          break;
        case 403:
          error.type = ERROR_TYPES.PERMISSION_DENIED;
          error.message = "Your account has been disabled. Please contact support.";
          break;
        case 404:
          error.type = ERROR_TYPES.NOT_FOUND;
          error.message = "Authentication service not found. Please try again later.";
          break;
        case 429:
          error.type = ERROR_TYPES.RATE_LIMITED;
          error.message = "Too many login attempts. Please try again later.";
          break;
        case 500:
        case 502:
        case 503:
        case 504:
          error.type = ERROR_TYPES.SERVICE_UNAVAILABLE;
          error.message = "Server error. Please try again later.";
          break;
        default:
          error.type = ERROR_TYPES.UNKNOWN_ERROR;
          error.message = errorData.error || "Failed to sign in";
      }
      
      throw error;
    }

    const data = await response.json();

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

    if (error.name === "AbortError") {
      const timeoutError = new Error("Login request timed out. Please try again.");
      timeoutError.type = ERROR_TYPES.TIMEOUT;
      throw timeoutError;
    }

    if (error.name === "TypeError" && error.message.includes("fetch")) {
      const networkError = new Error(
        "Network error. Please check your connection and try again."
      );
      networkError.type = ERROR_TYPES.NETWORK_ERROR;
      throw networkError;
    }

    // If the error already has a type, it's a standardized error
    if (!error.type) {
      error.type = ERROR_TYPES.UNKNOWN_ERROR;
    }

    throw error;
  }
}

/**
 * Sign up a new user with email and password
 * @param {Object} credentials - User signup data with email, password, and displayName
 * @returns {Promise<Object>} Authentication data with user and session
 */
export async function signUp({ email, password, displayName }) {
  // Input validation with standardized errors
  if (!email || !email.trim()) {
    const error = new Error("Email is required");
    error.type = ERROR_TYPES.VALIDATION_ERROR;
    throw error;
  }
  
  if (!password || !password.trim()) {
    const error = new Error("Password is required");
    error.type = ERROR_TYPES.VALIDATION_ERROR;
    throw error;
  }
  
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    const error = new Error("Please enter a valid email address");
    error.type = ERROR_TYPES.VALIDATION_ERROR;
    throw error;
  }
  
  if (password.length < 6) {
    const error = new Error("Password must be at least 6 characters");
    error.type = ERROR_TYPES.VALIDATION_ERROR;
    throw error;
  }

  try {
    // Network connectivity check
    if (typeof window !== "undefined" && !window.navigator.onLine) {
      const offlineError = new Error("No internet connection. Please check your network and try again.");
      offlineError.type = ERROR_TYPES.NETWORK_ERROR;
      offlineError.isOffline = true;
      throw offlineError;
    }
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000);
    
    const response = await fetch(AUTH_ENDPOINTS.SIGNUP, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ email, password, displayName }),
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);

    // Handle signup-specific error codes
    if (!response.ok) {
      let errorData;
      try {
        errorData = await response.json();
      } catch (e) {
        errorData = { error: `Error: ${response.status}` };
      }

      const error = new Error(errorData.error || "Signup failed");
      error.status = response.status;

      if (errorData.error === "User already exists" || response.status === 409) {
        error.type = ERROR_TYPES.ALREADY_EXISTS;
        error.message = "An account with this email already exists. Please log in instead.";
        throw error;
      }
      
      switch (response.status) {
        case 400:
          error.type = ERROR_TYPES.VALIDATION_ERROR;
          error.message = errorData.error || "Invalid signup data. Please check your information.";
          break;
        case 422:
          error.type = ERROR_TYPES.VALIDATION_ERROR;
          error.message = errorData.error || "Password too weak or email invalid.";
          break;
        case 429:
          error.type = ERROR_TYPES.RATE_LIMITED;
          error.message = "Too many signup attempts. Please try again later.";
          break;
        case 500:
        case 502:
        case 503:
        case 504:
          error.type = ERROR_TYPES.SERVICE_UNAVAILABLE;
          error.message = "Server error. Please try again later.";
          break;
        default:
          error.type = ERROR_TYPES.UNKNOWN_ERROR;
          error.message = errorData.error || "Failed to sign up";
      }
      
      throw error;
    }

    const data = await response.json();
    
    // Validate the response contains required data
    if (!data.user) {
      const validationError = new Error("Invalid response from authentication server");
      validationError.type = ERROR_TYPES.SERVICE_UNAVAILABLE;
      throw validationError;
    }

    try {
      localStorage.setItem(AUTH_STORAGE_KEYS.USER, JSON.stringify(data.user));
      if (data.session?.access_token) {
        localStorage.setItem(AUTH_STORAGE_KEYS.TOKEN, data.session.access_token);
      }
    } catch (storageError) {
      console.warn("Failed to store authentication in localStorage:", storageError);
    }

    return data;
  } catch (error) {
    console.error("Sign up error:", error);
    
    if (error.name === "AbortError") {
      const timeoutError = new Error("Signup request timed out. Please try again.");
      timeoutError.type = ERROR_TYPES.TIMEOUT;
      throw timeoutError;
    }
    
    if (error.name === "TypeError" && error.message.includes("fetch")) {
      const networkError = new Error("Network error. Please check your connection and try again.");
      networkError.type = ERROR_TYPES.NETWORK_ERROR;
      throw networkError;
    }
    
    if (!error.type) {
      error.type = ERROR_TYPES.UNKNOWN_ERROR;
    }
    
    throw error;
  }
}

/**
 * Sign out the current user
 * @returns {Promise<Object>} Response from the server
 */
export async function signOut() {
  try {
    // Network connectivity check
    if (typeof window !== "undefined" && !window.navigator.onLine) {
      // If offline, just clear local state
      localStorage.removeItem(AUTH_STORAGE_KEYS.USER);
      localStorage.removeItem(AUTH_STORAGE_KEYS.TOKEN);
      return { success: true, warning: "Offline signout - server session may still be active" };
    }
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);
    
    const response = await fetch(AUTH_ENDPOINTS.SIGNOUT, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);

    localStorage.removeItem(AUTH_STORAGE_KEYS.USER);
    localStorage.removeItem(AUTH_STORAGE_KEYS.TOKEN);

    if (!response.ok) {
      let errorData;
      try {
        errorData = await response.json();
      } catch (e) {
        errorData = { error: `Error: ${response.status}` };
      }
      
      const error = new Error(errorData.error || "Failed to sign out on server");
      error.status = response.status;
      
      switch (response.status) {
        case 401:
          error.type = ERROR_TYPES.AUTH_REQUIRED;
          break;
        case 403:
          error.type = ERROR_TYPES.PERMISSION_DENIED;
          break;
        case 500:
        case 502:
        case 503:
        case 504:
          error.type = ERROR_TYPES.SERVICE_UNAVAILABLE;
          break;
        default:
          error.type = ERROR_TYPES.UNKNOWN_ERROR;
      }
      
      // Still throw the error for proper handling
      throw error;
    }

    return await response.json();
  } catch (error) {
    console.error("Sign out error:", error);
    
    if (error.name === "AbortError") {
      return { 
        success: true, 
        warning: "Signout timed out, but local state has been cleared" 
      };
    }
    
    if (error.name === "TypeError" && error.message.includes("fetch")) {
      return { 
        success: true, 
        warning: "Network error during signout, but local state has been cleared" 
      };
    }
    
    if (!error.type) {
      error.type = ERROR_TYPES.UNKNOWN_ERROR;
    }
    
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
    if (!user || typeof user !== 'object' || !user.id) {
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

  // If we have stored data and don't need to refresh, return it immediately
  if (storedData?.user && !forceRefresh) {
    return storedData;
  }

  // Otherwise verify with the server
  try {
    // Network connectivity check
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
      
      const offlineError = new Error("No internet connection and no stored user data");
      offlineError.type = ERROR_TYPES.NETWORK_ERROR;
      offlineError.isOffline = true;
      throw offlineError;
    }
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);
    
    const response = await fetch(AUTH_ENDPOINTS.USER, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);

    if (!response.ok) {
      const error = new Error("Authentication check failed");
      error.status = response.status;
      
      if (response.status === 401 || response.status === 403) {
        localStorage.removeItem(AUTH_STORAGE_KEYS.USER);
        localStorage.removeItem(AUTH_STORAGE_KEYS.TOKEN);
        
        error.type = response.status === 401 ? ERROR_TYPES.AUTH_REQUIRED : ERROR_TYPES.PERMISSION_DENIED;
        error.message = response.status === 401 ? "Authentication expired" : "Access forbidden";
        
        return { 
          user: null, 
          session: null, 
          error: error.message
        };
      }
      
      if (response.status >= 500) {
        error.type = ERROR_TYPES.SERVICE_UNAVAILABLE;
        
        if (storedData) {
          return {
            ...storedData,
            session: {
              ...storedData.session,
              needs_refresh: true,
              warning: "Server error - using stored credentials",
            },
          };
        }
        
        throw error;
      }
      
      return { user: null, session: null };
    }

    // Server authentication successful
    const data = await response.json();
    
    if (!data || !data.user) {
      const invalidError = new Error("Invalid response from authentication server");
      invalidError.type = ERROR_TYPES.SERVICE_UNAVAILABLE;
      throw invalidError;
    }

    // Update localStorage with fresh data
    try {
      localStorage.setItem(AUTH_STORAGE_KEYS.USER, JSON.stringify(data.user));
      if (data.session?.access_token) {
        localStorage.setItem(AUTH_STORAGE_KEYS.TOKEN, data.session.access_token);
      }
    } catch (storageError) {
      console.warn("Failed to update localStorage with fresh user data:", storageError);
    }

    return data;
  } catch (error) {
    console.error("Get user error:", error);
    
    if (error.name === "AbortError") {
      const timeoutError = new Error("Authentication check timed out");
      timeoutError.type = ERROR_TYPES.TIMEOUT;
      
      // Fall back to stored data with warning if request times out
      if (storedData) {
        return {
          ...storedData,
          session: {
            ...storedData.session,
            needs_refresh: true,
            warning: "Request timed out - using stored credentials",
          },
        };
      }
      
      throw timeoutError;
    }

    if (error.name === "TypeError" && error.message.includes("fetch")) {
      const networkError = new Error("Network error during authentication check");
      networkError.type = ERROR_TYPES.NETWORK_ERROR;
      
      if (storedData) {
        return {
          ...storedData,
          session: {
            ...storedData.session,
            needs_refresh: true,
            warning: "Network error - using stored credentials",
          },
        };
      }
      
      throw networkError;
    }

    if (!error.type) {
      error.type = ERROR_TYPES.UNKNOWN_ERROR;
    }

    if (storedData) {
      return {
        ...storedData,
        session: {
          ...storedData.session,
          needs_refresh: true,
          warning: "Error during authentication check - using stored credentials",
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
    // Network connectivity check
    if (typeof window !== "undefined" && !window.navigator.onLine) {
      const offlineError = new Error("No internet connection. Please check your network and try again.");
      offlineError.type = ERROR_TYPES.NETWORK_ERROR;
      offlineError.isOffline = true;
      throw offlineError;
    }
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);
    
    const response = await fetch(AUTH_ENDPOINTS.PROTECTED, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);

    if (!response.ok) {
      let errorData;
      try {
        errorData = await response.json();
      } catch (e) {
        errorData = { error: `Error: ${response.status}` };
      }
      
      // Create a standardized error
      const error = new Error(errorData.error || "Failed to fetch protected data");
      error.status = response.status;
      
      // Handle common error cases
      if (response.status === 401 || response.status === 403) {
        error.type = response.status === 401 ? ERROR_TYPES.AUTH_REQUIRED : ERROR_TYPES.PERMISSION_DENIED;
        error.message = "Authentication required to access this data";
      } else if (response.status >= 500) {
        error.type = ERROR_TYPES.SERVICE_UNAVAILABLE;
      } else {
        error.type = ERROR_TYPES.UNKNOWN_ERROR;
      }
      
      throw error;
    }

    return await response.json();
  } catch (error) {
    console.error("Protected data error:", error);
    
    if (error.name === "AbortError") {
      const timeoutError = new Error("Request timed out. Please try again.");
      timeoutError.type = ERROR_TYPES.TIMEOUT;
      throw timeoutError;
    }
    
    if (error.name === "TypeError" && error.message.includes("fetch")) {
      const networkError = new Error("Network error. Please check your connection and try again.");
      networkError.type = ERROR_TYPES.NETWORK_ERROR;
      throw networkError;
    }
    
    // If the error already has a type, it's a standardized error
    if (!error.type) {
      error.type = ERROR_TYPES.UNKNOWN_ERROR;
    }
    
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
    // Input validation
    if (!data || typeof data !== 'object') {
      const validationError = new Error("Invalid data. Expected an object.");
      validationError.type = ERROR_TYPES.VALIDATION_ERROR;
      throw validationError;
    }
    
    // Network connectivity check
    if (typeof window !== "undefined" && !window.navigator.onLine) {
      const offlineError = new Error("No internet connection. Please check your network and try again.");
      offlineError.type = ERROR_TYPES.NETWORK_ERROR;
      offlineError.isOffline = true;
      throw offlineError;
    }
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);
    
    const response = await fetch(AUTH_ENDPOINTS.PROTECTED, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(data),
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);

    if (!response.ok) {
      let errorData;
      try {
        errorData = await response.json();
      } catch (e) {
        errorData = { error: `Error: ${response.status}` };
      }
      
      // Create a standardized error
      const error = new Error(errorData.error || "Failed to add data");
      error.status = response.status;
      
      // Handle common error cases
      switch (response.status) {
        case 400:
          error.type = ERROR_TYPES.VALIDATION_ERROR;
          error.message = errorData.error || "Invalid data format";
          break;
        case 401:
          error.type = ERROR_TYPES.AUTH_REQUIRED;
          error.message = "Authentication required to add data";
          break;
        case 403:
          error.type = ERROR_TYPES.PERMISSION_DENIED;
          error.message = "Authentication required to add data";
          break;
        case 413:
          error.type = ERROR_TYPES.FILE_TOO_LARGE;
          error.message = "Data size exceeds limit";
          break;
        case 429:
          error.type = ERROR_TYPES.RATE_LIMITED;
          error.message = "Too many requests. Please try again later.";
          break;
        case 500:
        case 502:
        case 503:
        case 504:
          error.type = ERROR_TYPES.SERVICE_UNAVAILABLE;
          error.message = "Server error. Please try again later.";
          break;
        default:
          error.type = ERROR_TYPES.UNKNOWN_ERROR;
          error.message = errorData.error || "Failed to add data";
      }
      
      throw error;
    }

    return await response.json();
  } catch (error) {
    console.error("Add protected data error:", error);
    
    if (error.name === "AbortError") {
      const timeoutError = new Error("Request timed out. Please try again.");
      timeoutError.type = ERROR_TYPES.TIMEOUT;
      throw timeoutError;
    }
    
    if (error.name === "TypeError" && error.message.includes("fetch")) {
      const networkError = new Error("Network error. Please check your connection and try again.");
      networkError.type = ERROR_TYPES.NETWORK_ERROR;
      throw networkError;
    }
    
    // If the error already has a type, it's a standardized error
    if (!error.type) {
      error.type = ERROR_TYPES.UNKNOWN_ERROR;
    }
    
    throw error;
  }
}