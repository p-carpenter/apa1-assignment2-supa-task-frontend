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
import { handleApiError, ERROR_TYPES } from "../utils/api/errors/errorHandling";

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
  const [isLoading, setIsLoading] = useState(false);
  const isAuthenticated = Boolean(user);

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

        // Validate with the server in the background
        setIsLoading(true);
        try {
          // Verify with server that the session is still valid
          const serverData = await getCurrentUser(true);

          if (serverData.user) {
            setUser(serverData.user);
            setSession(serverData.session);
          } else {
            console.log("Session validation failed - clearing local state");
            setUser(null);
            setSession(null);

            localStorage.removeItem(AUTH_STORAGE_KEYS.USER);
            localStorage.removeItem(AUTH_STORAGE_KEYS.TOKEN);
          }
        } catch (error) {
          console.error("Session validation error:", error);
          setUser(null);
          setSession(null);

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

      handleApiError(error, {
        defaultMessage: "Unable to sign in. Please try again.",
      });

      // TODO: Not sure if I want to throw errors here. I'm already returning it to thr user.
      // const enhancedError = new Error(standardError.message);
      // enhancedError.type = standardError.type;
      // enhancedError.status = standardError.status;
      // enhancedError.details = standardError.details;

      // throw enhancedError;
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

      handleApiError(error, {
        defaultMessage: "Unable to create account. Please try again.",
      });

      // const enhancedError = new Error(standardError.message);
      // enhancedError.type = standardError.type;
      // enhancedError.status = standardError.status;
      // enhancedError.details = standardError.details;

      // throw enhancedError;
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

      const standardError = handleApiError(error, {
        defaultMessage:
          "Error during sign out, but local session has been cleared.",
      });

      // TODO: I don't think throwing an error for auth errors is necessary
      if (
        // standardError.type !== ERROR_TYPES.AUTH_REQUIRED &&
        standardError.type !== ERROR_TYPES.NETWORK_ERROR
      ) {
        const enhancedError = new Error(standardError.message);
        enhancedError.type = standardError.type;
        enhancedError.status = standardError.status;
        throw enhancedError;
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

      const standardError = handleApiError(error, {
        defaultMessage: "Unable to refresh user information. Please try again.",
      });

      // const enhancedError = new Error(standardError.message);
      // enhancedError.type = standardError.type;
      // enhancedError.status = standardError.status;
      // enhancedError.details = standardError.details;

      // throw enhancedError;
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
