/**
 * Standard error types used throughout the application
 * @type {Object.<string, string>}
 */
export const ERROR_TYPES = {
  // Authentication related errors
  AUTH_REQUIRED: "auth_required",
  INVALID_CREDENTIALS: "invalid_credentials",
  SESSION_NOT_FOUND: "session_not_found",
  TOKEN_EXPIRED: "token_expired",

  // Permission related errors
  PERMISSION_DENIED: "permission_denied",

  // Resource related errors
  NOT_FOUND: "not_found",
  ALREADY_EXISTS: "already_exists",

  // File/upload related errors
  FILE_TOO_LARGE: "file_too_large",
  INVALID_FILE_TYPE: "invalid_file_type",

  // API related errors
  BAD_REQUEST: "bad_request",
  RATE_LIMITED: "rate_limited",
  SERVICE_UNAVAILABLE: "service_unavailable",

  // Network related errors
  NETWORK_ERROR: "network_error",
  TIMEOUT: "timeout",

  // Generic errors
  UNKNOWN_ERROR: "unknown_error",
};

/**
 * User-friendly error messages for each error type
 * @type {Object.<string, string>}
 */
export const ERROR_MESSAGES = {
  [ERROR_TYPES.BAD_REQUEST]: "Missing or invalid request data.",
  [ERROR_TYPES.AUTH_REQUIRED]: "Please sign in to continue.",
  [ERROR_TYPES.INVALID_CREDENTIALS]:
    "Invalid email or password. Please try again.",
  [ERROR_TYPES.SESSION_NOT_FOUND]:
    "User session not found. Signing in is optional.",
  [ERROR_TYPES.TOKEN_EXPIRED]:
    "Password reset token has expired. Please request a new one.",
  [ERROR_TYPES.PERMISSION_DENIED]:
    "You don't have permission to perform this action.",
  [ERROR_TYPES.NOT_FOUND]: "The requested resource was not found.",
  [ERROR_TYPES.ALREADY_EXISTS]: "This resource already exists.",
  [ERROR_TYPES.FILE_TOO_LARGE]: "The file is too large. Maximum size is 5MB.",
  [ERROR_TYPES.INVALID_FILE_TYPE]: "This file type is not supported.",
  [ERROR_TYPES.RATE_LIMITED]: "Too many requests. Please try again later.",
  [ERROR_TYPES.SERVICE_UNAVAILABLE]:
    "Service is temporarily unavailable. Please try again later.",
  [ERROR_TYPES.NETWORK_ERROR]:
    "Network error. Please check your connection and try again.",
  [ERROR_TYPES.TIMEOUT]: "Request timed out. Please try again.",
  [ERROR_TYPES.UNKNOWN_ERROR]: "An error occurred. Please try again.",
};
