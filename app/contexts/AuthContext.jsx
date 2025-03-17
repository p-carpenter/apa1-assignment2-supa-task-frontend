"use client";

import { createContext, useContext, useState, useEffect } from "react";
import {
  signIn,
  signUp,
  signOut,
  getCurrentUser,
} from "../utils/auth/authUtils";

const AuthContext = createContext();

// Local storage keys
const TOKEN_KEY = "auth_token";
const USER_KEY = "auth_user";

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Load user data from localStorage and/or cookies on initial mount
  useEffect(() => {
    const loadUserFromStorage = () => {
      try {
        const storedUser = localStorage.getItem(USER_KEY);
        const storedToken = localStorage.getItem(TOKEN_KEY);

        if (storedUser && storedToken) {
          return {
            user: JSON.parse(storedUser),
            token: storedToken,
          };
        }
      } catch (err) {
        console.error("Error loading from localStorage:", err);
      }
      return null;
    };

    async function loadUser() {
      try {
        setLoading(true);
        setError(null);

        // First try to load from localStorage
        const storedAuth = loadUserFromStorage();

        // Try to get the current user from the server (using cookies)
        // This will validate the session regardless of localStorage
        const { user: apiUser, session: apiSession } = await getCurrentUser();

        if (apiUser) {
          // User is authenticated via cookies
          setUser(apiUser);
          setSession(apiSession);

          // Update localStorage with the latest user data
          localStorage.setItem(USER_KEY, JSON.stringify(apiUser));
          if (apiSession?.access_token) {
            localStorage.setItem(TOKEN_KEY, apiSession.access_token);
          }
        } else if (storedAuth) {
          // No cookie auth but localStorage exists
          // We need to handle this case where cookies expired but localStorage still has data
          // This would allow us to show the user as logged in but handle re-authentication
          // when they access protected resources

          setUser(storedAuth.user);

          // Set a partial session to indicate token might need refreshing
          setSession({ needs_refresh: true });
        } else {
          // No authentication found
          localStorage.removeItem(USER_KEY);
          localStorage.removeItem(TOKEN_KEY);
          setUser(null);
          setSession(null);
        }
      } catch (err) {
        console.error("Error loading user:", err);
        setError(err.message);

        // If we get here, check if we have localStorage data
        const storedAuth = loadUserFromStorage();
        if (storedAuth) {
          // Use localStorage as fallback if cookie auth fails due to network issues
          setUser(storedAuth.user);
          setSession({ needs_refresh: true });
        }
      } finally {
        setLoading(false);
      }
    }

    loadUser();
  }, []);

  const login = async (credentials) => {
    try {
      setError(null);
      const { user, session } = await signIn(credentials);

      // Set state
      setUser(user);
      setSession(session);

      // Store in localStorage
      localStorage.setItem(USER_KEY, JSON.stringify(user));
      if (session?.access_token) {
        localStorage.setItem(TOKEN_KEY, session.access_token);
      }

      return { user, session };
    } catch (err) {
      console.error("Login error:", err);
      setError(err.message);
      throw err;
    }
  };

  const register = async (credentials) => {
    try {
      setError(null);
      const { user, session } = await signUp(credentials);

      // Set state
      setUser(user);
      setSession(session);

      // Store in localStorage
      localStorage.setItem(USER_KEY, JSON.stringify(user));
      if (session?.access_token) {
        localStorage.setItem(TOKEN_KEY, session.access_token);
      }

      return { user, session };
    } catch (err) {
      console.error("Registration error:", err);
      setError(err.message);
      throw err;
    }
  };

  const logout = async () => {
    try {
      setError(null);
      await signOut();

      // Clear state
      setUser(null);
      setSession(null);

      // Clear localStorage
      localStorage.removeItem(USER_KEY);
      localStorage.removeItem(TOKEN_KEY);
    } catch (err) {
      console.error("Logout error:", err);
      setError(err.message);

      // Even if the server-side logout fails, clear local state
      setUser(null);
      setSession(null);
      localStorage.removeItem(USER_KEY);
      localStorage.removeItem(TOKEN_KEY);

      throw err;
    }
  };

  // Function to handle token refresh when needed
  const refreshSession = async () => {
    try {
      setError(null);
      const { user: refreshedUser, session: refreshedSession } =
        await getCurrentUser();

      if (refreshedUser) {
        setUser(refreshedUser);
        setSession(refreshedSession);

        // Update localStorage
        localStorage.setItem(USER_KEY, JSON.stringify(refreshedUser));
        if (refreshedSession?.access_token) {
          localStorage.setItem(TOKEN_KEY, refreshedSession.access_token);
        }
        return true;
      } else {
        // No valid session, logout
        setUser(null);
        setSession(null);
        localStorage.removeItem(USER_KEY);
        localStorage.removeItem(TOKEN_KEY);
        return false;
      }
    } catch (err) {
      console.error("Session refresh error:", err);
      setError(err.message);
      return false;
    }
  };

  const value = {
    user,
    session,
    loading,
    error,
    login,
    register,
    logout,
    refreshSession,
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
