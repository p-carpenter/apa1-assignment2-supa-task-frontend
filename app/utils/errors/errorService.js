import { ERROR_TYPES, ERROR_MESSAGES } from "./errorTypes";

/**
 * Maps HTTP status codes to standard error types
 */
const STATUS_CODE_MAP = {
  400: ERROR_TYPES.BAD_REQUEST,
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
 * Checks if an error has already been processed by the error service
 *
 * @param {Object} error - The error object to check
 * @returns {boolean} True if the error has already been processed
 */
const isAlreadyProcessed = (error) => {
  return (
    error &&
    error.type &&
    typeof error.type === "string" &&
    ERROR_TYPES[error.type.toUpperCase()] === error.type
  );
};

/**
 * Creates a standardised error object with consistent structure
 *
 * @param {Error|Object} error - The original error object
 * @param {string} defaultMessage - Default message to use if none is found
 * @returns {Object} A standardised error object
 */
const createStandardError = (error, defaultMessage) => {
  return {
    type: ERROR_TYPES.UNKNOWN_ERROR,
    message: defaultMessage,
    details: null,
    status: error.status || 500,
    originalError: error,
    isProcessed: true,
  };
};

/**
 * Detects network errors caused by connectivity issues
 *
 * @param {Error|Object} error - The error object to check
 * @returns {boolean} True if the error is a network error
 */
const isNetworkError = (error) => {
  return (
    // Standard fetch network error
    (error.name === "TypeError" && error.message.includes("fetch")) ||
    // Error from clientApi.js with isOffline flag
    error.isOffline === true ||
    // Failed to fetch errors
    error.message?.includes("Failed to fetch") ||
    // Network request failed
    error.message?.includes("Network request failed") ||
    // Connection refused errors
    error.message?.includes("Connection refused") ||
    // ECONNREFUSED and similar Node.js errors
    error.code?.includes("ECONN") ||
    // Check if error has network-related properties
    error.type === ERROR_TYPES.NETWORK_ERROR
  );
};

/**
 * Creates network error with standard structure to provide user-friendly feedback.
 *
 * @param {Object} standardError - The standardised error object
 * @returns {Object} Error object with network information
 */
const handleNetworkError = (standardError) => {
  return {
    ...standardError,
    type: ERROR_TYPES.NETWORK_ERROR,
    message: ERROR_MESSAGES[ERROR_TYPES.NETWORK_ERROR],
    isOffline: typeof navigator !== "undefined" ? !navigator.onLine : false,
  };
};

/**
 * Detects authentication failures from error response content
 *
 * @param {Error|Object} error - The error object to check
 * @returns {boolean} True if the error indicates invalid credentials
 */
const isInvalidCredentialsError = (error) => {
  return error.status === 500 && error.data?.error?.includes("credentials");
};

/**
 * Detects expired or invalid sessions from error response content
 *
 * @param {Error|Object} error - The error object to check
 * @returns {boolean} True if the error indicates a session not found
 */
const isSessionNotFoundError = (error) => {
  return error.status === 401 && error.data?.error?.includes("session");
};

/**
 * Processes API-specific error responses based on status codes and content
 *
 * @param {Object} standardError - The standardised error object
 * @param {Error|Object} originalError - The original error from the API
 * @returns {Object} Error object with API-specific information
 */
const processApiSpecificError = (standardError, originalError) => {
  const error = { ...standardError };

  // Set error type based on HTTP status code
  if (originalError.status && STATUS_CODE_MAP[originalError.status]) {
    error.type = STATUS_CODE_MAP[originalError.status];
    error.message = ERROR_MESSAGES[error.type];
  }

  // Handle error details if present
  if (originalError.data?.error) {
    error.details = originalError.data.error;

    // Check for specific error conditions in the response
    if (isInvalidCredentialsError(originalError)) {
      error.type = ERROR_TYPES.INVALID_CREDENTIALS;
      error.message = ERROR_MESSAGES[ERROR_TYPES.INVALID_CREDENTIALS];
    } else if (isSessionNotFoundError(originalError)) {
      error.type = ERROR_TYPES.SESSION_NOT_FOUND;
      error.message = ERROR_MESSAGES[ERROR_TYPES.SESSION_NOT_FOUND];
    }
  }

  return error;
};

/**
 * Transforms various error objects into a standardised format for consistent handling.
 *
 * @param {Error|Object} error - Original error object from any source
 * @param {Object} [options={}] - Processing options
 * @param {string} [options.defaultMessage] - Fallback message if none can be determined
 * @returns {Object} standardised error object with consistent properties
 */
export const processApiError = (error, options = {}) => {
  const { defaultMessage = ERROR_MESSAGES[ERROR_TYPES.UNKNOWN_ERROR] } =
    options;

  // Return original error early if already processed
  if (isAlreadyProcessed(error)) {
    return error;
  }

  const standardError = createStandardError(error, defaultMessage);

  if (isNetworkError(error)) {
    return handleNetworkError(standardError);
  }

  return processApiSpecificError(standardError, error);
};

/**
 * Extract a user-friendly error message from various error formats
 *
 * @param {Object|string} error - Error object or error type string
 * @param {string} [fallback="An error occurred"] - Fallback message if none is found
 * @returns {string} User-friendly error message
 */
export const getErrorMessage = (error, fallback = "An error occurred") => {
  if (!error) return fallback;

  if (typeof error === "string") {
    return ERROR_MESSAGES[error] || error;
  }

  // Handle network error types specifically
  if (error.type === ERROR_TYPES.NETWORK_ERROR) {
    return ERROR_MESSAGES[ERROR_TYPES.NETWORK_ERROR];
  }

  // Supabase rejects known fake email addresses on their side
  if (
    error.details &&
    typeof error.details === "string" &&
    error.details.includes("Email address") &&
    error.details.includes("is invalid")
  ) {
    return "Please use a real email address. Test email domains are not accepted by Supabase.";
  }

  // Check for message in multiple locations
  const message =
    error.details ??
    error.message ??
    (error.type && ERROR_MESSAGES[error.type]) ??
    fallback;

  return message;
};

/**
 * Check if an error message is valid and not empty
 *
 * @param {string} message - Error message to check
 * @returns {boolean} True if message is valid and not empty
 */
export const hasErrorMessage = (message) => {
  return Boolean(message && message.trim() !== "");
};

/**
 * Check if an error object is valid and contains meaningful data
 *
 * @param {Object} error - Error object to check
 * @returns {boolean} True if error is valid and contains useful information
 */
export const isValidError = (error) => {
  return Boolean(error && (hasErrorMessage(error.message) || error.type));
};
