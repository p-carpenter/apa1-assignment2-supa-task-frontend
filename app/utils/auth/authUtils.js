"use client";

// Local storage keys
export const TOKEN_KEY = "auth_token";
export const USER_KEY = "auth_user";

/**
 * Sign in a user with email and password
 */
export async function signIn({ email, password }) {
  try {
    const response = await fetch("/api/auth/signin", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
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
      localStorage.setItem(USER_KEY, JSON.stringify(data.user));
    }
    if (data.session?.access_token) {
      localStorage.setItem(TOKEN_KEY, data.session.access_token);
    }

    return data;
  } catch (error) {
    console.error("Sign in error:", error);
    throw error;
  }
}

/**
 * Sign up a new user with email and password
 */
export async function signUp({ email, password, displayName }) {
  try {
    const response = await fetch("/api/auth/signup", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
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
      localStorage.setItem(USER_KEY, JSON.stringify(data.user));
    }
    if (data.session?.access_token) {
      localStorage.setItem(TOKEN_KEY, data.session.access_token);
    }

    return data;
  } catch (error) {
    console.error("Sign up error:", error);
    throw error;
  }
}

/**
 * Sign out the current user
 */
export async function signOut() {
  try {
    const response = await fetch("/api/auth/signout", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include", // Important for cookies
    });

    // Clear localStorage regardless of response
    localStorage.removeItem(USER_KEY);
    localStorage.removeItem(TOKEN_KEY);

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
 */
export async function getCurrentUser() {
  try {
    // First check localStorage for user data
    const storedUser = localStorage.getItem(USER_KEY);
    const storedToken = localStorage.getItem(TOKEN_KEY);
    const localData = storedUser ? { user: JSON.parse(storedUser) } : null;

    // Then verify with the server
    const response = await fetch("/api/auth/user", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
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
      localStorage.setItem(USER_KEY, JSON.stringify(data.user));
    }
    if (data.session?.access_token) {
      localStorage.setItem(TOKEN_KEY, data.session.access_token);
    }

    return data;
  } catch (error) {
    console.error("Get user error:", error);

    // On network error, fall back to localStorage if available
    const storedUser = localStorage.getItem(USER_KEY);
    const storedToken = localStorage.getItem(TOKEN_KEY);

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
 */
export async function getProtectedData() {
  try {
    const response = await fetch("/api/auth/protected", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
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
 */
export async function addProtectedData(data) {
  try {
    const response = await fetch("/api/auth/protected", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
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
