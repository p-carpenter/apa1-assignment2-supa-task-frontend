"use client";

import { AUTH_STORAGE_KEYS, AUTH_ENDPOINTS } from "./auth-config";

/**
 * Sign in a user with email and password
 * @param {Object} credentials - User credentials with email and password
 * @returns {Promise<Object>} Authentication data with user and session
 */
export async function signIn({ email, password }) {
  if (!email || !email.trim()) {
    throw new Error("Email is required");
  }

  if (!password || !password.trim()) {
    throw new Error("Password is required");
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    throw new Error("Please enter a valid email address");
  }

  try {
    // Network connectivity check
    if (typeof window !== "undefined" && !window.navigator.onLine) {
      throw new Error(
        "No internet connection. Please check your network and try again."
      );
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

      switch (response.status) {
        case 400:
          throw new Error(
            errorData.error ||
              "Invalid login request. Please check your credentials."
          );
        case 401:
          throw new Error("Invalid email or password. Please try again.");
        case 403:
          throw new Error(
            "Your account has been disabled. Please contact support."
          );
        case 404:
          throw new Error(
            "Authentication service not found. Please try again later."
          );
        case 429:
          throw new Error("Too many login attempts. Please try again later.");
        case 500:
        case 502:
        case 503:
        case 504:
          throw new Error("Server error. Please try again later.");
        default:
          throw new Error(errorData.error || "Failed to sign in");
      }
    }

    const data = await response.json();

    // Validate the response contains required data
    if (!data.user) {
      throw new Error("Invalid response from authentication server");
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
      throw new Error("Login request timed out. Please try again.");
    }

    if (error.name === "TypeError" && error.message.includes("fetch")) {
      throw new Error(
        "Network error. Please check your connection and try again."
      );
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
  // Input validation
  if (!email || !email.trim()) {
    throw new Error("Email is required");
  }
  
  if (!password || !password.trim()) {
    throw new Error("Password is required");
  }
  
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    throw new Error("Please enter a valid email address");
  }
  
  if (password.length < 6) {
    throw new Error("Password must be at least 6 characters");
  }

  try {
    // Network connectivity check
    if (typeof window !== "undefined" && !window.navigator.onLine) {
      throw new Error("No internet connection. Please check your network and try again.");
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

      if (errorData.error === "User already exists" || response.status === 409) {
        throw new Error("An account with this email already exists. Please log in instead.");
      }
      
      switch (response.status) {
        case 400:
          throw new Error(errorData.error || "Invalid signup data. Please check your information.");
        case 422:
          throw new Error(errorData.error || "Password too weak or email invalid.");
        case 429:
          throw new Error("Too many signup attempts. Please try again later.");
        case 500:
        case 502:
        case 503:
        case 504:
          throw new Error("Server error. Please try again later.");
        default:
          throw new Error(errorData.error || "Failed to sign up");
      }
    }

    const data = await response.json();
    
    // Validate the response contains required data
    if (!data.user) {
      throw new Error("Invalid response from authentication server");
    }

    // Store in localStorage for persistence
    try {
      localStorage.setItem(AUTH_STORAGE_KEYS.USER, JSON.stringify(data.user));
      if (data.session?.access_token) {
        localStorage.setItem(AUTH_STORAGE_KEYS.TOKEN, data.session.access_token);
      }
    } catch (storageError) {
      console.warn("Failed to store authentication in localStorage:", storageError);
      // Continue anyway as cookies are the primary auth method
    }

    return data;
  } catch (error) {
    console.error("Sign up error:", error);
    
    if (error.name === "AbortError") {
      throw new Error("Signup request timed out. Please try again.");
    }
    
    if (error.name === "TypeError" && error.message.includes("fetch")) {
      throw new Error("Network error. Please check your connection and try again.");
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

    // Clear localStorage regardless of response
    localStorage.removeItem(AUTH_STORAGE_KEYS.USER);
    localStorage.removeItem(AUTH_STORAGE_KEYS.TOKEN);

    if (!response.ok) {
      let errorData;
      try {
        errorData = await response.json();
      } catch (e) {
        errorData = { error: `Error: ${response.status}` };
      }
      
      // Still throw the error for proper handling
      throw new Error(errorData.error || "Failed to sign out on server");
    }

    return await response.json();
  } catch (error) {
    console.error("Sign out error:", error);
    
    if (error.name === "AbortError") {
      // For timeout, return success but with warning
      return { 
        success: true, 
        warning: "Signout timed out, but local state has been cleared" 
      };
    }
    
    if (error.name === "TypeError" && error.message.includes("fetch")) {
      // For network errors, return success but with warning
      return { 
        success: true, 
        warning: "Network error during signout, but local state has been cleared" 
      };
    }
    
    // For other errors, throw so caller can handle
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
    // Clear potentially corrupted data
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
  // First check localStorage
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
      throw new Error("No internet connection and no stored user data");
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
      // If unauthorized, clear localStorage as well
      if (response.status === 401 || response.status === 403) {
        localStorage.removeItem(AUTH_STORAGE_KEYS.USER);
        localStorage.removeItem(AUTH_STORAGE_KEYS.TOKEN);
        
        return { 
          user: null, 
          session: null, 
          error: response.status === 401 ? "Authentication expired" : "Access forbidden" 
        };
      }
      
      if (response.status >= 500) {
        // For server errors, fall back to stored data if available
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
      }
      
      return { user: null, session: null };
    }

    // Server authentication successful
    const data = await response.json();
    
    if (!data || !data.user) {
      throw new Error("Invalid response from authentication server");
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
      throw new Error("Authentication check timed out");
    }

    if (error.name === "TypeError" && error.message.includes("fetch")) {
      // Fall back to stored data with warning if network error
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
      throw new Error("Network error during authentication check");
    }

    // If we have stored data, fall back to it for other errors
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
      throw new Error("No internet connection. Please check your network and try again.");
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
      
      // Handle common error cases
      if (response.status === 401 || response.status === 403) {
        throw new Error("Authentication required to access this data");
      }
      
      throw new Error(errorData.error || "Failed to fetch protected data");
    }

    return await response.json();
  } catch (error) {
    console.error("Protected data error:", error);
    
    if (error.name === "AbortError") {
      throw new Error("Request timed out. Please try again.");
    }
    
    if (error.name === "TypeError" && error.message.includes("fetch")) {
      throw new Error("Network error. Please check your connection and try again.");
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
      throw new Error("Invalid data. Expected an object.");
    }
    
    // Network connectivity check
    if (typeof window !== "undefined" && !window.navigator.onLine) {
      throw new Error("No internet connection. Please check your network and try again.");
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
      
      // Handle common error cases
      switch (response.status) {
        case 400:
          throw new Error(errorData.error || "Invalid data format");
        case 401:
        case 403:
          throw new Error("Authentication required to add data");
        case 413:
          throw new Error("Data size exceeds limit");
        case 429:
          throw new Error("Too many requests. Please try again later.");
        case 500:
        case 502:
        case 503:
        case 504:
          throw new Error("Server error. Please try again later.");
        default:
          throw new Error(errorData.error || "Failed to add data");
      }
    }

    return await response.json();
  } catch (error) {
    console.error("Add protected data error:", error);
    
    if (error.name === "AbortError") {
      throw new Error("Request timed out. Please try again.");
    }
    
    if (error.name === "TypeError" && error.message.includes("fetch")) {
      throw new Error("Network error. Please check your connection and try again.");
    }
    
    throw error;
  }
}