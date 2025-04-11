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

/**
 * Context for authentication state and operations
 * @type {React.Context}
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
  handleResetPassword: async () => {},
  handleResetPasswordConfirm: async () => {},
});

/**
 * Manages authentication state and provides authentication methods
 *
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Child components
 * @param {Object} [props.initialUser=null] - Initial user data from SSR
 * @param {Object} [props.initialSession=null] - Initial session data from SSR
 */
export const AuthProvider = ({
  children,
  initialUser = null,
  initialSession = null,
}) => {
  const [user, setUser] = useState(initialUser);
  const [session, setSession] = useState(initialSession);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const isAuthenticated = Boolean(user);

  /**
   * Processes API errors into a standardised format
   * @param {Error} error - The error object
   * @param {string} defaultMessage - Default message to use if error is not formatted
   * @returns {Object} Standardised error object
   */
  const formatApiError = (error, defaultMessage) => {
    // If the error already has a type (processed by the API), use it directly
    if (error && error.type) {
      return {
        type: error.type,
        message: error.error,
        details: error.details,
      };
    }

    return processApiError(error, {
      defaultMessage,
    });
  };

  /**
   * Initialises authentication state from server or stored session
   */
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

  /**
   * Handles user sign in
   * @param {Object} credentials - User credentials (email, password)
   * @returns {Promise<Object>} Sign in result
   * @throws {Object} Standardised error object
   */
  const handleSignIn = useCallback(async (credentials) => {
    setIsLoading(true);
    setError(null);

    try {
      const data = await signIn(credentials);
      setUser(data.user);
      setSession(data.session);
      return data;
    } catch (error) {
      const standardError = formatApiError(
        error,
        "Unable to sign in. Please try again."
      );
      setError(standardError);
      throw standardError;
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Handles user sign up
   * @param {Object} credentials - User signup information (email, password, etc)
   * @returns {Promise<Object>} Sign up result
   * @throws {Object} Standardised error object
   */
  const handleSignUp = useCallback(async (credentials) => {
    setIsLoading(true);
    setError(null);

    try {
      const data = await signUp(credentials);
      return data;
    } catch (error) {
      const standardError = formatApiError(
        error,
        "Unable to create account. Please try again."
      );
      setError(standardError);
      throw standardError;
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Handles sign out operation
   * @returns {Promise<Object>} Sign out result
   * @throws {Object} Standardised error object (except for network errors)
   */
  const handleSignOut = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await signOut();
      clearUserState();
      return result;
    } catch (error) {
      // Always clear user state on signout attempt regardless of errors
      clearUserState();

      const standardError = formatApiError(
        error,
        "Error during sign out, but local session has been cleared."
      );
      setError(standardError);

      // Only throw for non-network errors
      if (standardError.type !== ERROR_TYPES.NETWORK_ERROR) {
        throw standardError;
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Clears the user and session state
   */
  const clearUserState = () => {
    setUser(null);
    setSession(null);
  };

  /**
   * Refreshes current user information from the server
   * @returns {Promise<Object>} Updated user data
   * @throws {Object} Standardised error object
   */
  const refreshUser = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const data = await getCurrentUser(true);

      if (data.user) {
        setUser(data.user);
        setSession(data.session);
      } else {
        clearUserState();
      }

      return data;
    } catch (error) {
      console.error("Refresh user error:", error);

      const standardError = formatApiError(
        error,
        "Unable to refresh user information. Please try again."
      );

      setError(standardError);
      throw standardError;
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Initiates password reset process
   * @param {string} email - User's email
   * @returns {Promise<Object>} Result of password reset request
   * @throws {Object} Standardised error object
   */
  const handleResetPassword = useCallback(async (email) => {
    setIsLoading(true);
    setError(null);

    try {
      const data = await resetPassword({ email });
      return data;
    } catch (error) {
      const standardError = formatApiError(
        error,
        "Unable to send password reset instructions. Please try again."
      );

      setError(standardError);
      throw standardError;
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Completes password reset with token verification
   * @param {Object} resetData - Password reset data
   * @param {string} resetData.email - User's email
   * @param {string} resetData.password - New password
   * @param {string} resetData.token - Reset token from email
   * @returns {Promise<Object>} Result of password reset operation
   * @throws {Object} Standardised error object
   */
  const handleResetPasswordConfirm = useCallback(
    async ({ email, password, token }) => {
      setIsLoading(true);
      setError(null);

      try {
        const data = await resetPasswordConfirm({ email, password, token });
        return data;
      } catch (error) {
        const standardError = formatApiError(
          error,
          "Unable to reset password. Please try again."
        );

        setError(standardError);
        throw standardError;
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  /**
   * Memoised auth context value to prevent unnecessary re-renders
   */
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
};

/**
 * Custom hook to use the auth context
 * @returns {Object} Auth context value
 * @throws {Error} If used outside of AuthProvider
 */
export const useAuth = () => {
  const context = useContext(AuthContext);

  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }

  return context;
};

export default AuthProvider;
