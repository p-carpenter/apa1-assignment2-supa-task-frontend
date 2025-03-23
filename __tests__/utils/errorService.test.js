import {
  processApiError,
  getErrorMessage,
  hasErrorMessage,
  isValidError,
} from "@/app/utils/errors/errorService";
import { ERROR_TYPES, ERROR_MESSAGES } from "@/app/utils/errors/errorTypes";

describe("Error Service", () => {
  describe("processApiError", () => {
    it("returns error object if it's already processed", () => {
      const processedError = {
        type: ERROR_TYPES.AUTH_REQUIRED,
        message: "Already processed error",
      };

      const result = processApiError(processedError);
      expect(result).toBe(processedError);
    });

    it("processes network fetch errors correctly", () => {
      const fetchError = new TypeError("Failed to fetch");
      const result = processApiError(fetchError);

      expect(result.type).toBe(ERROR_TYPES.NETWORK_ERROR);
      expect(result.message).toBe(ERROR_MESSAGES[ERROR_TYPES.NETWORK_ERROR]);
      expect(result.originalError).toBe(fetchError);
    });

    it("handles HTTP status codes and maps them to correct error types", () => {
      const statusCodes = [
        400, 401, 403, 404, 408, 409, 413, 415, 429, 500, 502, 503, 504,
      ];

      statusCodes.forEach((status) => {
        const error = { status };
        const result = processApiError(error);

        const expectedType = {
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
        }[status];

        expect(result.type).toBe(expectedType);
        expect(result.message).toBe(ERROR_MESSAGES[expectedType]);
        expect(result.status).toBe(status);
      });
    });

    it("uses server-provided error details when available", () => {
      const error = {
        status: 400,
        data: {
          error: "Custom server error message",
        },
      };

      const result = processApiError(error);
      expect(result.details).toBe("Custom server error message");
    });

    it("identifies credential errors from server response", () => {
      const error = {
        status: 500,
        data: {
          error: "Invalid user credentials",
        },
      };

      const result = processApiError(error);
      expect(result.type).toBe(ERROR_TYPES.INVALID_CREDENTIALS);
      expect(result.message).toBe(
        ERROR_MESSAGES[ERROR_TYPES.INVALID_CREDENTIALS]
      );
    });

    it("identifies session errors from server response", () => {
      const error = {
        status: 401,
        data: {
          error: "Cannot find user session",
        },
      };

      const result = processApiError(error);
      expect(result.type).toBe(ERROR_TYPES.SESSION_NOT_FOUND);
      expect(result.message).toBe(
        ERROR_MESSAGES[ERROR_TYPES.SESSION_NOT_FOUND]
      );
    });

    it("uses default message when no specific error can be determined", () => {
      const error = { status: 520 }; // Non-standard status code
      const result = processApiError(error);

      expect(result.type).toBe(ERROR_TYPES.UNKNOWN_ERROR);
      expect(result.message).toBe(ERROR_MESSAGES[ERROR_TYPES.UNKNOWN_ERROR]);
    });

    it("uses custom default message when provided", () => {
      const error = { status: 520 };
      const customMessage = "My custom fallback message";
      const result = processApiError(error, { defaultMessage: customMessage });

      expect(result.message).toBe(customMessage);
    });

    it("sets isOffline flag correctly based on navigator.onLine", () => {
      // Mock navigator.onLine
      const originalOnLine = navigator.onLine;
      Object.defineProperty(navigator, "onLine", {
        configurable: true,
        get: jest.fn().mockReturnValue(false),
      });

      const fetchError = new TypeError("Failed to fetch");
      const result = processApiError(fetchError);

      expect(result.isOffline).toBe(true);

      // Restore original navigator.onLine
      Object.defineProperty(navigator, "onLine", {
        configurable: true,
        get: jest.fn().mockReturnValue(originalOnLine),
      });
    });
  });

  describe("getErrorMessage", () => {
    it("returns fallback message when no error is provided", () => {
      expect(getErrorMessage(null, "Fallback message")).toBe(
        "Fallback message"
      );
      expect(getErrorMessage(undefined, "Fallback message")).toBe(
        "Fallback message"
      );
    });

    it("looks up error type in ERROR_MESSAGES when string is provided", () => {
      expect(getErrorMessage(ERROR_TYPES.AUTH_REQUIRED)).toBe(
        ERROR_MESSAGES[ERROR_TYPES.AUTH_REQUIRED]
      );
    });

    it("returns the string directly if not found in ERROR_MESSAGES", () => {
      expect(getErrorMessage("custom_error_type")).toBe("custom_error_type");
    });

    it("returns error.details when object is provided and has details", () => {
      const error = { details: "Detailed error information" };
      expect(getErrorMessage(error)).toBe("Detailed error information");
    });

    it("returns fallback when object without details is provided", () => {
      const error = { type: ERROR_TYPES.UNKNOWN_ERROR };
      expect(getErrorMessage(error, "Fallback message")).toBe(
        "Fallback message"
      );
    });
  });

  describe("hasErrorMessage", () => {
    it("returns false for null or undefined messages", () => {
      expect(hasErrorMessage(null)).toBe(false);
      expect(hasErrorMessage(undefined)).toBe(false);
    });

    it("returns false for empty messages", () => {
      expect(hasErrorMessage("")).toBe(false);
      expect(hasErrorMessage("   ")).toBe(false);
    });

    it("returns true for valid messages", () => {
      expect(hasErrorMessage("Error message")).toBe(true);
    });
  });

  describe("isValidError", () => {
    it("returns false for null or undefined errors", () => {
      expect(isValidError(null)).toBe(false);
      expect(isValidError(undefined)).toBe(false);
    });

    it("returns true for errors with valid message", () => {
      expect(isValidError({ message: "Valid error message" })).toBe(true);
    });

    it("returns true for errors with type but no message", () => {
      expect(isValidError({ type: ERROR_TYPES.AUTH_REQUIRED })).toBe(true);
    });

    it("returns false for errors with empty message and no type", () => {
      expect(isValidError({ message: "" })).toBe(false);
      expect(isValidError({ message: "   " })).toBe(false);
    });
  });

  describe("Edge cases", () => {
    it("handles non-standard error objects gracefully", () => {
      const nonStandardErrors = [
        { foo: "bar" },
        123,
        "string error",
        new Date(),
        [],
        true,
      ];

      nonStandardErrors.forEach((error) => {
        // Should not throw errors
        const result = processApiError(error);
        expect(result.type).toBe(ERROR_TYPES.UNKNOWN_ERROR);
      });
    });

    it("handles various error types with minimal information", () => {
      const minimalErrors = [
        { status: 401 },
        { status: 500, data: {} },
        { status: 404, data: { error: null } },
      ];

      minimalErrors.forEach((error) => {
        const result = processApiError(error);
        expect(result.status).toBe(error.status);
        expect(result.type).toBeDefined();
        expect(result.message).toBeDefined();
      });
    });
  });
});
