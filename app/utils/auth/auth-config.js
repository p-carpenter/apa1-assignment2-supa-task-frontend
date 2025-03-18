/**
 * Authentication configuration constants
 * Centralizes all auth-related configuration in one file
 */

// Local storage keys for auth data persistence
export const AUTH_STORAGE_KEYS = {
  TOKEN: "auth_token",
  USER: "auth_user",
};

// API endpoints for authentication
export const AUTH_ENDPOINTS = {
  SIGNIN: "/api/auth/signin",
  SIGNUP: "/api/auth/signup",
  SIGNOUT: "/api/auth/signout",
  USER: "/api/auth/user",
  PROTECTED: "/api/auth/protected",
};

// Supabase cookie names
export const SUPABASE_COOKIES = {
  ACCESS_TOKEN: "sb-access-token",
  REFRESH_TOKEN: "sb-refresh-token",
};

// Edge function endpoints
export const EDGE_FUNCTIONS = {
  USER: "/authentication/user",
  VALIDATE: "/validate-auth",
};
