"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
} from "react";
import {
  signIn,
  signUp,
  signOut,
  getCurrentUser,
  resetPassword,
  resetPasswordConfirm,
} from "../utils/auth/client";
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
  handleResetPassword: async () => {},
  handleResetPasswordConfirm: async () => {},
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

      // Verify with server that session is valid
      const data = await getCurrentUser(true);

      if (data.user && data.session) {
        setUser(data.user);
        setSession(data.session);
      } else {
        setUser(null);
        setSession(null);


        if (data.error) {
          setError({
            message: data.error,
            type: data.type || ERROR_TYPES.UNKNOWN_ERROR,
          });
        }
      }

      setIsLoading(false);
    };

    initialiseAuth();
  }, [initialUser, initialSession]);

  const handleSignIn = useCallback(async (credentials) => {
    setIsLoading(true);
    setError(null);

    try {
      const data = await signIn(credentials);
      setUser(data.user);
      setSession(data.session);
      return data;
    } catch (error) {
      // If the error already has a type (processed by the API), use it directly
      if (error && error.type) {
        const formattedError = {
          type: error.type,
          message: error.error,
          details: error.details,
        };
        setError(formattedError);
        throw formattedError;
      }

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
      // cannot set session here as session is null until email confirmation
      setUser(data.user);
      return data;
    } catch (error) {
      if (error && error.type) {
        const formattedError = {
          type: error.type,
          message: error.error,
          details: error.details,
        };
        setError(formattedError);
        throw formattedError;
      }

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
      // Always clear user state on signout attempt regardless of errors
      setUser(null);
      setSession(null);

      if (error && error.type) {
        const formattedError = {
          type: error.type,
          message: error.error,
          details: error.details,
        };
        setError(formattedError);

        if (formattedError.type !== ERROR_TYPES.NETWORK_ERROR) {
          throw formattedError;
        }
        return;
      }

      const standardError = processApiError(error, {
        defaultMessage:
          "Error during sign out, but local session has been cleared.",
      });

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

  const handleResetPassword = useCallback(async (email) => {
    setIsLoading(true);
    setError(null);

    try {
      const data = await resetPassword({ email });
      return data;
    } catch (error) {
      if (error && error.type) {
        const formattedError = {
          type: error.type,
          message: error.error,
          details: error.details,
        };
        setError(formattedError);
        throw formattedError;
      }

      const standardError = processApiError(error, {
        defaultMessage:
          "Unable to send password reset instructions. Please try again.",
      });

      setError(standardError);
      throw standardError;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleResetPasswordConfirm = useCallback(
    async ({ email, password, token }) => {
      setIsLoading(true);
      setError(null);

      try {
        const data = await resetPasswordConfirm({ email, password, token });
        return data;
      } catch (error) {
        if (error && error.type) {
          const formattedError = {
            type: error.type,
            message: error.error,
            details: error.details,
          };
          setError(formattedError);
          throw formattedError;
        }

        const standardError = processApiError(error, {
          defaultMessage: "Unable to reset password. Please try again.",
        });

        setError(standardError);
        throw standardError;
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

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
      handleResetPassword,
      handleResetPasswordConfirm,
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
      handleResetPassword,
      handleResetPasswordConfirm,
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
