/**
 * Error codes and their standard messages
 */
export const ERROR_TYPES = {
  // Authentication related errors
  AUTH_REQUIRED: "auth_required",
  INVALID_CREDENTIALS: "invalid_credentials",
  SESSION_EXPIRED: "session_expired",

  // Permission related errors
  PERMISSION_DENIED: "permission_denied",

  // Resource related errors
  NOT_FOUND: "not_found",
  ALREADY_EXISTS: "already_exists",

  // Validation related errors
  VALIDATION_ERROR: "validation_error",

  // File/upload related errors
  FILE_TOO_LARGE: "file_too_large",
  INVALID_FILE_TYPE: "invalid_file_type",

  // API related errors
  RATE_LIMITED: "rate_limited",
  SERVICE_UNAVAILABLE: "service_unavailable",

  // Network related errors
  NETWORK_ERROR: "network_error",
  TIMEOUT: "timeout",

  // Generic errors
  UNKNOWN_ERROR: "unknown_error",
};

/**
 * User-friendly error messages
 */
const ERROR_MESSAGES = {
  [ERROR_TYPES.AUTH_REQUIRED]: "Please sign in to continue.",
  [ERROR_TYPES.INVALID_CREDENTIALS]:
    "Invalid email or password. Please try again.",
  [ERROR_TYPES.SESSION_EXPIRED]:
    "Your session has expired. Please sign in again.",
  [ERROR_TYPES.PERMISSION_DENIED]:
    "You don't have permission to perform this action.",
  [ERROR_TYPES.NOT_FOUND]: "The requested resource was not found.",
  [ERROR_TYPES.ALREADY_EXISTS]: "This resource already exists.",
  [ERROR_TYPES.VALIDATION_ERROR]: "Please check your input and try again.",
  [ERROR_TYPES.FILE_TOO_LARGE]: "The file is too large. Maximum size is 2MB.",
  [ERROR_TYPES.INVALID_FILE_TYPE]: "This file type is not supported.",
  [ERROR_TYPES.RATE_LIMITED]: "Too many requests. Please try again later.",
  [ERROR_TYPES.SERVICE_UNAVAILABLE]:
    "Service is temporarily unavailable. Please try again later.",
  [ERROR_TYPES.NETWORK_ERROR]:
    "Network error. Please check your connection and try again.",
  [ERROR_TYPES.TIMEOUT]: "Request timed out. Please try again.",
  [ERROR_TYPES.UNKNOWN_ERROR]: "An error occurred. Please try again.",
};

/**
 * Maps HTTP status codes to error types
 */
const STATUS_CODE_MAP = {
  400: ERROR_TYPES.VALIDATION_ERROR,
  401: ERROR_TYPES.AUTH_REQUIRED,
  401: ERROR_TYPES.SESSION_EXPIRED,
  403: ERROR_TYPES.PERMISSION_DENIED,
  404: ERROR_TYPES.NOT_FOUND,
  408: ERROR_TYPES.TIMEOUT,
  409: ERROR_TYPES.ALREADY_EXISTS,
  413: ERROR_TYPES.FILE_TOO_LARGE,
  415: ERROR_TYPES.INVALID_FILE_TYPE,
  429: ERROR_TYPES.RATE_LIMITED,
  500: ERROR_TYPES.SERVICE_UNAVAILABLE,
  502: ERROR_TYPES.SERVICE_UNAVAILABLE,
  503: ERROR_TYPES.SERVICE_UNAVAILABLE,
  504: ERROR_TYPES.TIMEOUT,
};

/**
 * Processes API error responses and returns standardized error objects
 *
 * @param {Error} error - The error object from the API call
 * @param {Object} options - Options for error handling
 * @param {string} options.defaultMessage - Default message if none can be determined
 * @param {Function} options.logger - Custom logger function
 * @returns {Object} Standardized error object with type, message, and details
 */
export const handleApiError = (error, options = {}) => {
  const {
    defaultMessage = ERROR_MESSAGES[ERROR_TYPES.UNKNOWN_ERROR]
  } = options;

  // Default error object
  const standardError = {
    type: ERROR_TYPES.UNKNOWN_ERROR,
    message: defaultMessage,
    details: null,
    status: error.status || 500,
    originalError: error,
  };

  // Check if it's a network error (fetch failed completely)
  if (error.name === "TypeError" && error.message.includes("fetch")) {
    return {
      ...standardError,
      type: ERROR_TYPES.NETWORK_ERROR,
      message: ERROR_MESSAGES[ERROR_TYPES.NETWORK_ERROR],
      isOffline: !navigator.onLine,
    };
  }

  if (error.status && STATUS_CODE_MAP[error.status]) {
    standardError.type = STATUS_CODE_MAP[error.status];
    standardError.message = ERROR_MESSAGES[standardError.type];
  }

  // Handle special cases with more specific error information
  if (error.status === 400 && error.data?.validationErrors) {
    // Handle field-level validation errors
    standardError.details = error.data.validationErrors;
  } else if (error.data?.error) {
    // Use server-provided error message if available
    standardError.details = error.data.error;

    // Special case for auth errors that need specific messages
    if (error.status === 401 && error.data.error.includes("credentials")) {
      standardError.type = ERROR_TYPES.INVALID_CREDENTIALS;
      standardError.message = ERROR_MESSAGES[ERROR_TYPES.INVALID_CREDENTIALS];
    }

    // Handle session expiry specifically
    if (error.status === 401 && error.data.error.includes("expired")) {
      standardError.type = ERROR_TYPES.SESSION_EXPIRED;
      standardError.message = ERROR_MESSAGES[ERROR_TYPES.SESSION_EXPIRED];
    }
  }

  return standardError;
};

/**
 * Processes form validation errors
 *
 * @param {Object} validationErrors - Field-level validation errors
 * @returns {Object} Standardized error object focused on form validation
 */
export const handleValidationError = (validationErrors) => {
  return {
    type: ERROR_TYPES.VALIDATION_ERROR,
    message: ERROR_MESSAGES[ERROR_TYPES.VALIDATION_ERROR],
    details: validationErrors,
    isValidationError: true,
  };
};

/**
 * Gets user-friendly error message to display
 *
 * @param {Object|string} error - Error object or error type string
 * @param {string} fallback - Fallback message if none is found
 * @returns {string} User-friendly error message
 */
export const getErrorMessage = (error, fallback = "An error occurred") => {
  if (!error) return fallback;

  if (typeof error === "string") {
    return ERROR_MESSAGES[error] || error;
  }

  // Handle error objects
  return error.message || fallback;
};

/**
 * Check if an error message is empty or not
 *
 * @param {string} message - Error message to check
 * @returns {boolean} True if message is not empty, false otherwise
 */
export const hasErrorMessage = (message) => {
  return Boolean(message && message.trim() !== "");
};

/**
 * Check if an error object is valid and contains meaningful data
 *
 * @param {Object} error - Error object to check
 * @returns {boolean} True if error is valid, false otherwise
 */
export const isValidError = (error) => {
  return Boolean(error && (hasErrorMessage(error.message) || error.type));
};

/**
 * Coordinate between parent-provided errors and component-internal errors
 *
 * @param {Object} externalError - Error provided by parent component
 * @param {Object} internalError - Error generated internally
 * @param {string} errorMessage - Simple error message string
 * @returns {Object} The error to display, or null if no valid error
 */
export const resolveError = (externalError, internalError, errorMessage) => {
  if (isValidError(externalError)) {
    return externalError;
  }

  if (isValidError(internalError)) {
    return internalError;
  }

  if (hasErrorMessage(errorMessage)) {
    return {
      message: errorMessage,
      type: ERROR_TYPES.UNKNOWN_ERROR,
    };
  }

  return null;
};
