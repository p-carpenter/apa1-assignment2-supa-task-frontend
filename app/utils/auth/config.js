/**
 * Authentication configuration constants
 */
export const AUTH_ENDPOINTS = {
  SIGNIN: "/api/auth/signin",
  SIGNUP: "/api/auth/signup",
  SIGNOUT: "/api/auth/signout",
  USER: "/api/auth/user",
  PROTECTED: "/api/auth/protected",
  PASSWORD_RECOVERY: "/api/auth/password-recovery",
  PASSWORD_RECOVERY_CONFIRM: "/api/auth/password-recovery/confirm",
};

/**
 * Edge function endpoints
 */
export const EDGE_FUNCTIONS = {
  USER: "/authentication/user",
  VALIDATE: "/validate-auth",
};

/**
 * Cookie for authentication
 */
export const AUTH_COOKIE_NAMES = {
  ACCESS_TOKEN: "sb-access-token",
  REFRESH_TOKEN: "sb-refresh-token",
};

/**
 * Authentication configuration
 */
export const AUTH_CONFIG = {
  // Cookie settings
  cookieOptions: {
    secure: process.env.NODE_ENV === "production",
    httpOnly: true,
    path: "/",
    sameSite: "lax",
  },

  // Token expiration times in seconds
  tokenExpiration: {
    access: 3600, // 1 hour
    refresh: 7776000, // 90 days
  },
};

/**
 * CORS headers for API routes
 */
export const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Authorization, Content-Type",
  "Content-Type": "application/json",
};
