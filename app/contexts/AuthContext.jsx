"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import {
  signIn,
  signUp,
  signOut,
  getCurrentUser,
  getStoredUser,
} from "../utils/auth/authUtils";
import { AUTH_STORAGE_KEYS } from "../utils/auth/auth-config";

/**
 * Authentication Context
 * Provides authentication state and methods to the application
 */

// Create context with default values
export const AuthContext = createContext({
  user: null,
  session: null,
  isAuthenticated: false,
  isLoading: false,
  signIn: async () => {},
  signUp: async () => {},
  signOut: async () => {},
  refreshUser: async () => {},
});

/**
 * Auth Provider Component
 * Manages authentication state and provides authentication methods
 */
export function AuthProvider({
  children,
  initialUser = null,
  initialSession = null,
}) {
  const [user, setUser] = useState(initialUser);
  const [session, setSession] = useState(initialSession);
  const [isLoading, setIsLoading] = useState(false); // Start with not loading
  const isAuthenticated = Boolean(user);

  // Initialize auth state on mount
  useEffect(() => {
    const initializeAuth = async () => {
      // If we have SSR data, use it directly
      if (initialUser && initialSession) {
        setUser(initialUser);
        setSession(initialSession);
        return;
      }

      // First check localStorage (no loading state yet)
      const storedData = getStoredUser();
      if (storedData?.user) {
        // Temporarily set the user from localStorage
        setUser(storedData.user);
        setSession(storedData.session);

        // But also validate with the server in the background
        setIsLoading(true);
        try {
          // Verify with server that the session is still valid
          const serverData = await getCurrentUser(true);

          if (serverData.user) {
            // Session valid, update with the server data
            setUser(serverData.user);
            setSession(serverData.session);
          } else {
            // Session invalid, clear the user state
            console.log("Session validation failed - clearing local state");
            setUser(null);
            setSession(null);

            // Also clear localStorage
            localStorage.removeItem(AUTH_STORAGE_KEYS.USER);
            localStorage.removeItem(AUTH_STORAGE_KEYS.TOKEN);
          }
        } catch (error) {
          // On error, assume session is invalid
          console.error("Session validation error:", error);
          setUser(null);
          setSession(null);

          // Also clear localStorage
          localStorage.removeItem(AUTH_STORAGE_KEYS.USER);
          localStorage.removeItem(AUTH_STORAGE_KEYS.TOKEN);
        } finally {
          setIsLoading(false);
        }
      }
    };

    initializeAuth();
  }, [initialUser, initialSession]);

  // Authentication methods
  const handleSignIn = useCallback(async (credentials) => {
    setIsLoading(true);
    try {
      const data = await signIn(credentials);
      setUser(data.user);
      setSession(data.session);
      return data;
    } catch (error) {
      console.error("Sign in handler error:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleSignUp = useCallback(async (credentials) => {
    setIsLoading(true);
    try {
      const data = await signUp(credentials);
      setUser(data.user);
      setSession(data.session);
      return data;
    } catch (error) {
      console.error("Sign up handler error:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleSignOut = useCallback(async () => {
    setIsLoading(true);
    try {
      await signOut();
      setUser(null);
      setSession(null);
    } catch (error) {
      console.error("Sign out handler error:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const refreshUser = useCallback(async () => {
    setIsLoading(true);
    try {
      // Force server verification when explicitly refreshing
      const data = await getCurrentUser(true);
      setUser(data.user);
      setSession(data.session);
      return data;
    } catch (error) {
      console.error("Refresh user error:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const contextValue = {
    user,
    session,
    isAuthenticated,
    isLoading,
    signIn: handleSignIn,
    signUp: handleSignUp,
    signOut: handleSignOut,
    refreshUser,
  };

  return (
    <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
  );
}

/**
 * Custom hook to use the auth context
 * @returns {Object} Auth context value
 */
export function useAuth() {
  const context = useContext(AuthContext);

  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }

  return context;
}

export default AuthProvider;
