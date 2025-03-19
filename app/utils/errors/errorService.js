// app/utils/errors/errorService.js
import { ERROR_TYPES, ERROR_MESSAGES } from "./errorTypes";

/**
 * Maps HTTP status codes to standard error types
 */
const STATUS_CODE_MAP = {
  400: ERROR_TYPES.VALIDATION_ERROR,
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
 * Process API errors into a standardized format
 * @param {Error} error - The original error object
 * @param {Object} options - Options for error processing
 * @param {string} options.defaultMessage - Default message if none can be determined
 * @returns {Object} Standardized error object with type, message, and details
 */
export const processApiError = (error, options = {}) => {
  const { defaultMessage = ERROR_MESSAGES[ERROR_TYPES.UNKNOWN_ERROR] } =
    options;

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

  // Map status code to error type
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

  // Check for "User already exists" error
  if (error.status === 400) {
    const errorDetails = error.details || error.data?.details;
    const errorMessage = error.message || error.data?.error || "";

    if (
      (typeof errorDetails === "string" &&
        errorDetails.includes("already exists")) ||
      (typeof errorMessage === "string" &&
        errorMessage.includes("already exists"))
    ) {
      standardError.type = ERROR_TYPES.ALREADY_EXISTS;
      standardError.message = ERROR_MESSAGES[ERROR_TYPES.ALREADY_EXISTS];
    }
  }

  return standardError;
};

/**
 * Process form validation errors
 * @param {Object} validationErrors - Field-level validation errors
 * @returns {Object} Standardized error object for validation errors
 */
export const processValidationError = (validationErrors) => {
  return {
    type: ERROR_TYPES.VALIDATION_ERROR,
    message: ERROR_MESSAGES[ERROR_TYPES.VALIDATION_ERROR],
    details: validationErrors,
    isValidationError: true,
  };
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

  // Handle error objects
  return error.message || fallback;
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

/**
 * Resolve which error to display in a form component
 * @param {Object} apiError - Error from API call
 * @param {Object} validationError - Error from form validation
 * @param {Object} fieldErrors - Field-level errors
 * @returns {Object|null} The error to display, or null if no valid error
 */
export const resolveFormError = (
  apiError,
  validationError,
  fieldErrors = {}
) => {
  if (isValidError(apiError)) {
    return apiError;
  }

  if (isValidError(validationError)) {
    return validationError;
  }

  const hasFieldErrors = Object.values(fieldErrors).some((err) =>
    hasErrorMessage(err)
  );
  if (hasFieldErrors) {
    return processValidationError(fieldErrors);
  }

  return null;
};
