// app/utils/errors/errorService.js
import { ERROR_TYPES, ERROR_MESSAGES } from "./errorTypes";

/**
 * Maps HTTP status codes to standard error types
 */
const STATUS_CODE_MAP = {
  401: ERROR_TYPES.AUTH_REQUIRED,
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
 * Process API errors into a standardised format
 * @param {Error} error - The original error object
 * @param {Object} options - Options for error processing
 * @param {string} options.defaultMessage - Default message if none can be determined
 * @returns {Object} Error object with type, message, and details
 */
export const processApiError = (error, options = {}) => {
  const { defaultMessage = ERROR_MESSAGES[ERROR_TYPES.UNKNOWN_ERROR] } =
    options;

  // return error if it's already been processed
  if (
    error &&
    error.type &&
    typeof error.type === "string" &&
    ERROR_TYPES[error.type.toUpperCase()] === error.type
  ) {
    return error;
  }

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

  if (error.data?.error) {
    // Use server-provided error message if available
    standardError.details = error.data.error;

    if (error.status === 500 && error.data.error.includes("credentials")) {
      standardError.type = ERROR_TYPES.INVALID_CREDENTIALS;
      standardError.message = ERROR_MESSAGES[ERROR_TYPES.INVALID_CREDENTIALS];
    }

    if (error.status === 401 && error.data.error.includes("session")) {
      standardError.type = ERROR_TYPES.SESSION_NOT_FOUND;
      standardError.message = ERROR_MESSAGES[ERROR_TYPES.SESSION_NOT_FOUND];
    }
  }

  // if (error.status === 400) {
  //   const errorDetails = error.details || error.data?.details;
  //   const errorMessage = error.message || error.data?.error || "";

  //   if (
  //     (typeof errorDetails === "string" &&
  //       errorDetails.includes("already exists")) ||
  //     (typeof errorMessage === "string" &&
  //       errorMessage.includes("already exists"))
  //   ) {
  //     standardError.type = ERROR_TYPES.ALREADY_EXISTS;
  //     standardError.message = ERROR_MESSAGES[ERROR_TYPES.ALREADY_EXISTS];
  //   }
  // }

  return standardError;
};

/**
 * Get a user-friendly error message from an error object
 * @param {Object|string} error - Error object or type string
 * @param {string} fallback - Fallback message if none is found
 * @returns {string} User-friendly error message
 */
export const getErrorMessage = (error, fallback = "An error occurred") => {
  if (!error) return fallback;

  if (typeof error === "string") {
    return ERROR_MESSAGES[error] || error;
  }

  return error.details || fallback;
};

/**
 * Check if an error message is valid and not empty
 * @param {string} message - Error message to check
 * @returns {boolean} True if message is valid, false otherwise
 */
export const hasErrorMessage = (message) => {
  return Boolean(message && message.trim() !== "");
};

/**
 * Check if an error object is valid and contains meaningful data
 * @param {Object} error - Error object to check
 * @returns {boolean} True if error is valid, false otherwise
 */
export const isValidError = (error) => {
  return Boolean(error && (hasErrorMessage(error.message) || error.type));
};
