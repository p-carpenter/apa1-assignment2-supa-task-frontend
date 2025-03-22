import { server } from "../../app/utils/testing/test-utils";
import { http, HttpResponse } from "msw";
import { POST as POSTPasswordRecovery } from "@/app/api/auth/password-recovery/route";
import { POST as POSTPasswordRecoveryConfirm } from "@/app/api/auth/password-recovery/confirm/route";
import * as clientApi from "@/app/utils/api/clientApi";
import { ERROR_TYPES, ERROR_MESSAGES } from "@/app/utils/errors/errorTypes";
import { processApiError } from "@/app/utils/errors/errorService";
import { CORS_HEADERS } from "@/app/utils/auth/config";

// Mock the dependencies
jest.mock("@/app/utils/api/clientApi", () => ({
  fetchFromSupabase: jest.fn(),
}));

jest.mock("@/app/utils/errors/errorService", () => ({
  processApiError: jest.fn((error, options = {}) => ({
    type: error.type || ERROR_TYPES.UNKNOWN_ERROR,
    message: options.defaultMessage || error.message || ERROR_MESSAGES[ERROR_TYPES.UNKNOWN_ERROR],
    details: error.details || null,
    status: error.status || 500,
    originalError: error,
    isProcessed: true,
  })),
}));

// Disable console.error during tests to avoid noisy logs
const originalConsoleError = console.error;
beforeAll(() => {
  console.error = jest.fn();
});

afterAll(() => {
  console.error = originalConsoleError;
});

describe("auth/password-recovery API routes", () => {
  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();

    // Mock Date.now for consistent timestamps
    jest
      .spyOn(Date.prototype, "toISOString")
      .mockReturnValue("2023-01-01T00:00:00.000Z");
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe("password-recovery route", () => {
    it("successfully requests a password reset", async () => {
      // Mock successful fetchFromSupabase response
      clientApi.fetchFromSupabase.mockResolvedValueOnce({
        message: "Password reset email sent",
      });

      const mockRequest = {
        json: () => Promise.resolve({ email: "test@example.com" }),
      };

      const response = await POSTPasswordRecovery(mockRequest);
      expect(response instanceof Response).toBe(true);

      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toEqual({
        message: "Password reset instructions sent",
        timestamp: "2023-01-01T00:00:00.000Z",
      });

      // Verify fetchFromSupabase was called with the right arguments
      expect(clientApi.fetchFromSupabase).toHaveBeenCalledWith(
        "password-recovery",
        "POST",
        { email: "test@example.com" }
      );

      // Check CORS headers are present
      expect(response.headers.get("Access-Control-Allow-Origin")).toBe(
        CORS_HEADERS["Access-Control-Allow-Origin"]
      );
    });

    it("returns error when email is missing", async () => {
      const mockRequest = {
        json: () => Promise.resolve({}),
      };

      // Mock processApiError to return a specific error for this test
      processApiError.mockReturnValueOnce({
        type: ERROR_TYPES.VALIDATION_ERROR,
        message: "Failed to send password reset instructions",
        details: "Email is required",
        status: 500,
        isProcessed: true,
      });

      const response = await POSTPasswordRecovery(mockRequest);
      const data = await response.json();

      expect(response.status).toBe(500); // Default error status
      expect(data.message).toBe("Failed to send password reset instructions");
      expect(data.details).toBe("Email is required");
      expect(data).toHaveProperty("timestamp", "2023-01-01T00:00:00.000Z");
    });

    it("handles error from supabase API", async () => {
      const mockError = new Error("User not found");
      mockError.status = 404;
      mockError.data = { error: "User not found" };

      clientApi.fetchFromSupabase.mockRejectedValueOnce(mockError);
      processApiError.mockReturnValueOnce({
        type: ERROR_TYPES.NOT_FOUND,
        message: "Failed to send password reset instructions",
        details: "User not found",
        status: 404,
        originalError: mockError,
        isProcessed: true,
      });

      const mockRequest = {
        json: () => Promise.resolve({ email: "nonexistent@example.com" }),
      };

      const response = await POSTPasswordRecovery(mockRequest);
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data).toHaveProperty("type", ERROR_TYPES.NOT_FOUND);
      expect(data).toHaveProperty("message", "Failed to send password reset instructions");
      expect(data).toHaveProperty("timestamp", "2023-01-01T00:00:00.000Z");
    });

    it("handles JSON parsing errors", async () => {
      const mockRequest = {
        json: () => Promise.reject(new Error("JSON parse error")),
      };

      const response = await POSTPasswordRecovery(mockRequest);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data).toHaveProperty("timestamp", "2023-01-01T00:00:00.000Z");
    });

    it("handles network errors", async () => {
      const networkError = new Error("Network error");
      networkError.name = "TypeError";
      networkError.message = "Failed to fetch";

      clientApi.fetchFromSupabase.mockRejectedValueOnce(networkError);
      processApiError.mockReturnValueOnce({
        type: ERROR_TYPES.NETWORK_ERROR,
        message: "Failed to send password reset instructions",
        status: 500,
        originalError: networkError,
        isProcessed: true,
      });

      const mockRequest = {
        json: () => Promise.resolve({ email: "test@example.com" }),
      };

      const response = await POSTPasswordRecovery(mockRequest);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data).toHaveProperty("type", ERROR_TYPES.NETWORK_ERROR);
      expect(data).toHaveProperty("timestamp", "2023-01-01T00:00:00.000Z");
    });
  });

  describe("password-recovery/confirm route", () => {
    it("successfully confirms password reset", async () => {
      // Mock successful fetchFromSupabase response
      clientApi.fetchFromSupabase.mockResolvedValueOnce({
        message: "Password has been reset",
      });

      const mockRequest = {
        json: () =>
          Promise.resolve({
            email: "test@example.com",
            password: "newPassword123!",
            token: "valid-reset-token",
          }),
      };

      const response = await POSTPasswordRecoveryConfirm(mockRequest);
      expect(response instanceof Response).toBe(true);

      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toEqual({
        message: "Password has been reset successfully",
        timestamp: "2023-01-01T00:00:00.000Z",
      });

      // Verify fetchFromSupabase was called with the right arguments
      expect(clientApi.fetchFromSupabase).toHaveBeenCalledWith(
        "password-recovery/confirm",
        "POST",
        {
          email: "test@example.com",
          password: "newPassword123!",
          token: "valid-reset-token",
        }
      );
    });

    it("successfully cleans token if it includes access_token format", async () => {
      clientApi.fetchFromSupabase.mockResolvedValueOnce({
        message: "Password has been reset",
      });

      const mockRequest = {
        json: () =>
          Promise.resolve({
            email: "test@example.com",
            password: "newPassword123!",
            token: "access_token=valid-reset-token",
          }),
      };

      const response = await POSTPasswordRecoveryConfirm(mockRequest);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.message).toBe("Password has been reset successfully");

      // Verify token was cleaned
      expect(clientApi.fetchFromSupabase).toHaveBeenCalledWith(
        "password-recovery/confirm",
        "POST",
        {
          email: "test@example.com",
          password: "newPassword123!",
          token: "valid-reset-token", // Token should be cleaned
        }
      );
    });

    it("returns error when email is missing", async () => {
      const mockRequest = {
        json: () =>
          Promise.resolve({
            password: "newPassword123!",
            token: "valid-reset-token",
          }),
      };

      // Mock processApiError to return a specific error for this test
      processApiError.mockReturnValueOnce({
        type: ERROR_TYPES.VALIDATION_ERROR,
        message: "Failed to reset password",
        details: "Email, password, and token are required",
        status: 500,
        isProcessed: true,
      });

      const response = await POSTPasswordRecoveryConfirm(mockRequest);
      const data = await response.json();

      expect(response.status).toBe(500); // Default error status
      expect(data.message).toBe("Failed to reset password");
      expect(data.details).toBe("Email, password, and token are required");
      expect(data).toHaveProperty("timestamp", "2023-01-01T00:00:00.000Z");
    });

    it("returns error when password is missing", async () => {
      const mockRequest = {
        json: () =>
          Promise.resolve({
            email: "test@example.com",
            token: "valid-reset-token",
          }),
      };

      // Mock processApiError to return a specific error for this test
      processApiError.mockReturnValueOnce({
        type: ERROR_TYPES.VALIDATION_ERROR,
        message: "Failed to reset password",
        details: "Email, password, and token are required",
        status: 500,
        isProcessed: true,
      });

      const response = await POSTPasswordRecoveryConfirm(mockRequest);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.message).toBe("Failed to reset password");
      expect(data.details).toBe("Email, password, and token are required");
    });

    it("returns error when token is missing", async () => {
      const mockRequest = {
        json: () =>
          Promise.resolve({
            email: "test@example.com",
            password: "newPassword123!",
          }),
      };

      // Mock processApiError to return a specific error for this test
      processApiError.mockReturnValueOnce({
        type: ERROR_TYPES.VALIDATION_ERROR,
        message: "Failed to reset password",
        details: "Email, password, and token are required",
        status: 500,
        isProcessed: true,
      });

      const response = await POSTPasswordRecoveryConfirm(mockRequest);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.message).toBe("Failed to reset password");
      expect(data.details).toBe("Email, password, and token are required");
    });

    it("handles error with invalid reset token", async () => {
      const mockError = new Error("Invalid or expired reset token");
      mockError.status = 400;
      mockError.data = { error: "Invalid or expired reset token" };

      clientApi.fetchFromSupabase.mockRejectedValueOnce(mockError);
      processApiError.mockReturnValueOnce({
        type: ERROR_TYPES.VALIDATION_ERROR,
        message: "Failed to reset password",
        details: "Invalid or expired reset token",
        status: 400,
        originalError: mockError,
        isProcessed: true,
      });

      const mockRequest = {
        json: () =>
          Promise.resolve({
            email: "test@example.com",
            password: "newPassword123!",
            token: "invalid-token",
          }),
      };

      const response = await POSTPasswordRecoveryConfirm(mockRequest);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data).toHaveProperty("type", ERROR_TYPES.VALIDATION_ERROR);
      expect(data).toHaveProperty("message", "Failed to reset password");
      expect(data).toHaveProperty("timestamp", "2023-01-01T00:00:00.000Z");
    });

    it("handles JSON parsing errors", async () => {
      const mockRequest = {
        json: () => Promise.reject(new Error("JSON parse error")),
      };

      const response = await POSTPasswordRecoveryConfirm(mockRequest);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data).toHaveProperty("timestamp", "2023-01-01T00:00:00.000Z");
    });

    it("handles network errors", async () => {
      const networkError = new Error("Network error");
      networkError.name = "TypeError";
      networkError.message = "Failed to fetch";

      clientApi.fetchFromSupabase.mockRejectedValueOnce(networkError);
      processApiError.mockReturnValueOnce({
        type: ERROR_TYPES.NETWORK_ERROR,
        message: "Failed to reset password",
        status: 500,
        originalError: networkError,
        isProcessed: true,
      });

      const mockRequest = {
        json: () =>
          Promise.resolve({
            email: "test@example.com",
            password: "newPassword123!",
            token: "valid-reset-token",
          }),
      };

      const response = await POSTPasswordRecoveryConfirm(mockRequest);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data).toHaveProperty("type", ERROR_TYPES.NETWORK_ERROR);
      expect(data).toHaveProperty("timestamp", "2023-01-01T00:00:00.000Z");
    });

    it("handles supabase server errors", async () => {
      const serverError = new Error("Internal server error");
      serverError.status = 500;
      serverError.data = { error: "Database error" };

      clientApi.fetchFromSupabase.mockRejectedValueOnce(serverError);
      processApiError.mockReturnValueOnce({
        type: ERROR_TYPES.SERVICE_UNAVAILABLE,
        message: "Failed to reset password",
        details: "Database error",
        status: 500,
        originalError: serverError,
        isProcessed: true,
      });

      const mockRequest = {
        json: () =>
          Promise.resolve({
            email: "test@example.com",
            password: "newPassword123!",
            token: "valid-reset-token",
          }),
      };

      const response = await POSTPasswordRecoveryConfirm(mockRequest);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data).toHaveProperty("type", ERROR_TYPES.SERVICE_UNAVAILABLE);
      expect(data).toHaveProperty("message", "Failed to reset password");
    });
  });
});
