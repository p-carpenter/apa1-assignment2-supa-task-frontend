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
} from "../utils/auth/client";
import { AUTH_STORAGE_KEYS } from "../utils/auth/config";
import { ERROR_TYPES } from "../utils/errors/errorTypes";
import { processApiError } from "../utils/errors/errorService";

/**
 * Authentication Context
 * Provides authentication state and methods to the application
 */

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
 * Manages authentication state and provides authentication methods
 */
export function AuthProvider({
  children,
  initialUser = null,
  initialSession = null,
}) {
  const [user, setUser] = useState(initialUser);
  const [session, setSession] = useState(initialSession);
  const [isLoading, setIsLoading] = useState(true);
  const isAuthenticated = Boolean(user);

  useEffect(() => {
    const initialiseAuth = async () => {
      // If we have SSR data, use it directly
      if (initialUser && initialSession) {
        setUser(initialUser);
        setSession(initialSession);
        setIsLoading(false);
        return;
      }

      // Check localStorage for immediate UI feedback
      const storedData = getStoredUser();
      if (storedData?.user) {
        // Temporarily set the user from localStorage
        setUser(storedData.user);
        setSession(storedData.session);
      }

      try {
        // Only try server verification if there's localStorage data
        if (storedData?.user) {
          // Verify with server that the session is still valid
          const serverData = await getCurrentUser(true);

          if (serverData.user) {
            setUser(serverData.user);
            setSession(serverData.session);
          } else {
            setUser(null);
            setSession(null);
            localStorage.removeItem(AUTH_STORAGE_KEYS.USER);
            localStorage.removeItem(AUTH_STORAGE_KEYS.TOKEN);
          }
        } else {
          setUser(null);
          setSession(null);
        }
      } catch (error) {
        console.warn("Session verification failed:", error);

        const standardError = processApiError(error);

        // If we get auth errors, clear everything
        if (
          standardError.type === ERROR_TYPES.AUTH_REQUIRED ||
          standardError.type === ERROR_TYPES.SESSION_EXPIRED
        ) {
          setUser(null);
          setSession(null);
          localStorage.removeItem(AUTH_STORAGE_KEYS.USER);
          localStorage.removeItem(AUTH_STORAGE_KEYS.TOKEN);
        }
      } finally {
        setIsLoading(false);
      }
    };

    initialiseAuth();
  }, [initialUser, initialSession]);

  const handleSignIn = useCallback(async (credentials) => {
    setIsLoading(true);

    try {
      if (!credentials.email || !credentials.password) {
        console.error("Missing credentials");
        const validationError = {
          type: ERROR_TYPES.VALIDATION_ERROR,
          message: "Email and password are required",
          details: {
            email: !credentials.email ? "Email is required" : "",
            password: !credentials.password ? "Password is required" : "",
          },
        };
        throw validationError;
      }

      const data = await signIn(credentials);
      setUser(data.user);
      setSession(data.session);
      return data;
    } catch (error) {
      const standardError = processApiError(error, {
        defaultMessage: "Unable to sign in. Please try again.",
      });

      throw standardError;
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

      const standardError = processApiError(error, {
        defaultMessage: "Unable to create account. Please try again.",
      });

      throw standardError;
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

      const standardError = processApiError(error, {
        defaultMessage:
          "Error during sign out, but local session has been cleared.",
      });

      setUser(null);
      setSession(null);

      if (standardError.type !== ERROR_TYPES.NETWORK_ERROR) {
        throw standardError;
      }
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

      const standardError = processApiError(error, {
        defaultMessage: "Unable to refresh user information. Please try again.",
      });

      throw standardError;
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
