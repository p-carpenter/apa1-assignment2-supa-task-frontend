import { ERROR_TYPES, ERROR_MESSAGES } from "./errorTypes";

/**
 * Maps HTTP status codes to standard error types
 * @type {Object.<number, string>}
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
 * Transforms diverse error types into a consistent structure
 * 
 * This centralized error processing ensures:
 * - Consistent error handling across the application
 * - User-friendly messages for common failure cases
 * - Detailed logging for debugging
 * - Proper HTTP status code mapping 
 * 
 * @param {Error} error - Original error from any source
 * @param {Object} [options={}] - Processing options
 * @param {string} [options.defaultMessage] - Fallback message
 * @returns {Object} Standardized error object
 */
export const processApiError = (error, options = {}) => {
  const { defaultMessage = ERROR_MESSAGES[ERROR_TYPES.UNKNOWN_ERROR] } = options;

  // Return error if it's already been processed
  if (isAlreadyProcessed(error)) {
    return error;
  }

  // Create standard error object with default values
  const standardError = createStandardError(error, defaultMessage);
  
  // Check for specific error conditions and update standardError
  if (isNetworkError(error)) {
    return handleNetworkError(standardError);
  }

  // Check if we can determine error type from status code
  if (error.status && STATUS_CODE_MAP[error.status]) {
    standardError.type = STATUS_CODE_MAP[error.status];
    standardError.message = ERROR_MESSAGES[standardError.type];
  }

  // Handle server-provided error details
  if (error.data?.error) {
    standardError.details = error.data.error;
    
    // Check for specific error messages in the server response
    if (isInvalidCredentialsError(error)) {
      standardError.type = ERROR_TYPES.INVALID_CREDENTIALS;
      standardError.message = ERROR_MESSAGES[ERROR_TYPES.INVALID_CREDENTIALS];
    }

    if (isSessionNotFoundError(error)) {
      standardError.type = ERROR_TYPES.SESSION_NOT_FOUND;
      standardError.message = ERROR_MESSAGES[ERROR_TYPES.SESSION_NOT_FOUND];
    }
  }

  return standardError;
};

// Pure helper functions for error detection and processing

/**
 * Checks if an error has already been processed by looking for standard type markers
 */
function isAlreadyProcessed(error) {
  return (
    error &&
    error.type &&
    typeof error.type === "string" &&
    ERROR_TYPES[error.type.toUpperCase()] === error.type
  );
}

/**
 * Creates a standardized error object with consistent structure
 * This ensures all downstream handlers receive predictable properties
 */
function createStandardError(error, defaultMessage) {
  return {
    type: ERROR_TYPES.UNKNOWN_ERROR,
    message: defaultMessage,
    details: null,
    status: error.status || 500,
    originalError: error,
    isProcessed: true
  };
}

/**
 * Detects network errors caused by connectivity issues
 * Needed to provide appropriate offline feedback to users
 */
function isNetworkError(error) {
  return error.name === "TypeError" && error.message.includes("fetch");
}

/**
 * Enhances network errors with connectivity status for UI feedback
 */
function handleNetworkError(standardError) {
  return {
    ...standardError,
    type: ERROR_TYPES.NETWORK_ERROR,
    message: ERROR_MESSAGES[ERROR_TYPES.NETWORK_ERROR],
    isOffline: typeof navigator !== 'undefined' ? !navigator.onLine : false
  };
}

/**
 * Detects authentication failures from error response content
 */
function isInvalidCredentialsError(error) {
  return error.status === 500 && error.data.error.includes("credentials");
}

/**
 * Detects expired or invalid sessions from error response content
 */
function isSessionNotFoundError(error) {
  return error.status === 401 && error.data.error.includes("session");
}

/**
 * Get a user-friendly error message from an error object
 * 
 * @param {Object|string} error - Error object or type string
 * @param {string} [fallback="An error occurred"] - Fallback message if none is found
 * @returns {string} User-friendly error message
 */
export const getErrorMessage = (error, fallback = "An error occurred") => {
  if (!error) return fallback;

  if (typeof error === "string") {
    return ERROR_MESSAGES[error] || error;
  }

  return error.message || error.details || fallback;
};

/**
 * Check if an error message is valid and not empty
 * 
 * @param {string} message - Error message to check
 * @returns {boolean} True if message is valid, false otherwise
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
