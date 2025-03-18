"use client";

import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { 
  signIn, 
  signUp, 
  signOut, 
  getCurrentUser 
} from "../utils/auth/authUtils";
import { AUTH_STORAGE_KEYS } from "../utils/auth/auth-config";

// Create context with default values
export const AuthContext = createContext({
  user: null,
  session: null,
  isAuthenticated: false,
  isLoading: true,
  signIn: async () => {},
  signUp: async () => {},
  signOut: async () => {},
  refreshUser: async () => {},
});

/**
 * Auth Provider Component
 * Manages authentication state and provides authentication methods
 */
export function AuthProvider({ children, initialUser = null, initialSession = null }) {
  const [user, setUser] = useState(initialUser);
  const [session, setSession] = useState(initialSession);
  const [isLoading, setIsLoading] = useState(!initialUser);
  const isAuthenticated = Boolean(user);

  // Initialize auth state on mount and when initialUser/Session change
  useEffect(() => {
    // Skip initialization if we already have user data from SSR
    if (initialUser && initialSession) {
      setUser(initialUser);
      setSession(initialSession);
      setIsLoading(false);
      return;
    }

    // Otherwise, try to restore from localStorage or fetch from server
    const initializeAuth = async () => {
      setIsLoading(true);
      try {
        const data = await getCurrentUser();
        setUser(data.user);
        setSession(data.session);
      } catch (error) {
        console.error("Error initializing auth:", error);
        setUser(null);
        setSession(null);
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, [initialUser, initialSession]);

  // Sync auth state to localStorage
  useEffect(() => {
    if (typeof window === "undefined") return;
    
    if (user) {
      localStorage.setItem(AUTH_STORAGE_KEYS.USER, JSON.stringify(user));
    } else {
      localStorage.removeItem(AUTH_STORAGE_KEYS.USER);
    }

    if (session?.access_token) {
      localStorage.setItem(AUTH_STORAGE_KEYS.TOKEN, session.access_token);
    } else {
      localStorage.removeItem(AUTH_STORAGE_KEYS.TOKEN);
    }
  }, [user, session]);

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
      const data = await getCurrentUser();
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

  // Create context value object
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
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
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

// Default export for compatibility with existing code
export default AuthProvider;
