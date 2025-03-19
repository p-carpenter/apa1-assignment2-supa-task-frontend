"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
} from "react";
import { signIn, signUp, signOut, getCurrentUser } from "../utils/auth/client";
import { ERROR_TYPES } from "../utils/errors/errorTypes";
import { processApiError } from "../utils/errors/errorService";

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
  const [error, setError] = useState(null);
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

      try {
        // Verify with server that session is valid
        const data = await getCurrentUser();

        if (data.user) {
          setUser(data.user);
          setSession(data.session);
        } else {
          setUser(null);
          setSession(null);

          // If specific error, store it
          if (data.error) {
            setError({
              message: data.error,
              type: data.errorType || ERROR_TYPES.UNKNOWN_ERROR,
            });
          }
        }
      } catch (error) {
        console.warn("Session verification failed:", error);

        const standardError = processApiError(error);
        setError(standardError);

        // If auth errors, clear user state
        if (
          standardError.type === ERROR_TYPES.AUTH_REQUIRED ||
          standardError.type === ERROR_TYPES.SESSION_EXPIRED
        ) {
          setUser(null);
          setSession(null);
        }
      } finally {
        setIsLoading(false);
      }
    };

    initialiseAuth();
  }, [initialUser, initialSession]);

  const handleSignIn = useCallback(async (credentials) => {
    setIsLoading(true);
    setError(null);

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

      setError(standardError);
      throw standardError;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleSignUp = useCallback(async (credentials) => {
    setIsLoading(true);
    setError(null);

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

      setError(standardError);
      throw standardError;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleSignOut = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await signOut();
      setUser(null);
      setSession(null);
      return result;
    } catch (error) {
      console.error("Sign out handler error:", error);

      const standardError = processApiError(error, {
        defaultMessage:
          "Error during sign out, but local session has been cleared.",
      });

      // Always clear user state on signout attempt regardless of errors
      setUser(null);
      setSession(null);

      setError(standardError);
      if (standardError.type !== ERROR_TYPES.NETWORK_ERROR) {
        throw standardError;
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  const refreshUser = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const data = await getCurrentUser(true);

      if (data.user) {
        setUser(data.user);
        setSession(data.session);
      } else {
        setUser(null);
        setSession(null);
      }

      return data;
    } catch (error) {
      console.error("Refresh user error:", error);

      const standardError = processApiError(error, {
        defaultMessage: "Unable to refresh user information. Please try again.",
      });

      setError(standardError);
      throw standardError;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Use memoized context value to prevent unnecessary re-renders
  const contextValue = useMemo(
    () => ({
      user,
      session,
      isAuthenticated,
      isLoading,
      error,
      signIn: handleSignIn,
      signUp: handleSignUp,
      signOut: handleSignOut,
      refreshUser,
    }),
    [
      user,
      session,
      isAuthenticated,
      isLoading,
      error,
      handleSignIn,
      handleSignUp,
      handleSignOut,
      refreshUser,
    ]
  );

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
