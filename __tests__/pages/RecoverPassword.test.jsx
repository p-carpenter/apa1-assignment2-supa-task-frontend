import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { http, HttpResponse } from "msw";
import { server } from "@/app/utils/testing/test-utils";
import { useAuth } from "@/app/contexts/AuthContext";
import ResetPasswordPage from "@/app/reset_password/page";
import ConfirmResetPage from "@/app/reset_password/confirm/page";
import { ERROR_TYPES } from "@/app/utils/errors/errorTypes";

const mockRouter = {
  push: jest.fn(),
};

const mockSearchParams = {
  get: jest.fn(),
  has: jest.fn(),
};

jest.mock("next/navigation", () => ({
  useRouter: jest.fn(() => mockRouter),
  useSearchParams: jest.fn(() => mockSearchParams),
}));

const mockAuthContext = {
  isAuthenticated: false,
  loading: false,
  handleResetPassword: jest.fn(),
  handleResetPasswordConfirm: jest.fn(),
};

jest.mock("@/app/contexts/AuthContext", () => ({
  useAuth: jest.fn(() => mockAuthContext),
}));

// Mock window.location
const originalWindowLocation = window.location;

describe("Password Recovery Flow Tests", () => {
  beforeEach(() => {
    jest.clearAllMocks();

    mockRouter.push.mockReset();
    mockSearchParams.get.mockImplementation((param) => {
      if (param === "token") return "test-token";
      if (param === "email") return "test@example.com";
      return null;
    });
    mockSearchParams.has.mockReturnValue(true);

    mockAuthContext.handleResetPassword.mockReset();
    mockAuthContext.handleResetPasswordConfirm.mockReset();
    mockAuthContext.isAuthenticated = false;
    mockAuthContext.loading = false;

    // Mock window.location
    Object.defineProperty(window, "location", {
      value: {
        ...originalWindowLocation,
        hash: "#access_token=test-token",
        pathname: "/reset_password/confirm",
        assign: jest.fn(),
        search: "?token=test-token&email=test@example.com",
      },
      writable: true,
      configurable: true,
    });

    // Mock MSW handlers
    server.use(
      http.post("/api/auth/password-recovery", () => {
        return HttpResponse.json({
          message: "Password reset instructions sent",
        });
      }),

      http.post("/api/auth/password-recovery/confirm", async ({ request }) => {
        const body = await request.json();

        if (!body.email || !body.password || !body.token) {
          return new HttpResponse(
            JSON.stringify({
              error: "Email, password, and token are required",
            }),
            { status: 400 }
          );
        }

        return HttpResponse.json({
          message: "Password has been reset successfully",
        });
      })
    );
  });

  afterEach(() => {
    Object.defineProperty(window, "location", {
      value: originalWindowLocation,
    });
  });

  describe("Password Reset Request Page", () => {
    it("renders the password reset request form", () => {
      render(<ResetPasswordPage />);

      expect(
        screen.getByRole("button", { name: /SEND RESET LINK/i })
      ).toBeInTheDocument();
      expect(screen.getByLabelText(/EMAIL/i)).toBeInTheDocument();
      expect(
        screen.getByRole("heading", { name: /RECOVER ACCESS/i })
      ).toBeInTheDocument();
    });

    it("redirects to profile if already authenticated", () => {
      useAuth.mockReturnValueOnce({
        ...mockAuthContext,
        isAuthenticated: true,
        loading: false,
      });

      render(<ResetPasswordPage />);

      expect(mockRouter.push).toHaveBeenCalledWith("/profile");
    });

    it("validates email input - empty", async () => {
      render(<ResetPasswordPage />);

      const submitButton = screen.getByTestId("reset-password-button");
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/Email is required/i)).toBeInTheDocument();
      });
    });

    it("validates email input - invalid format", async () => {
      render(<ResetPasswordPage />);

      const emailInput = screen.getByLabelText(/EMAIL/i);
      fireEvent.change(emailInput, { target: { value: "invalidemail" } });

      const submitButton = screen.getByTestId("reset-password-button");
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(
          screen.getByText(/Please enter a valid email address/i)
        ).toBeInTheDocument();
      });
    });

    it("submits the form successfully", async () => {
      mockAuthContext.handleResetPassword.mockResolvedValueOnce({
        message: "Password reset instructions sent",
      });

      render(<ResetPasswordPage />);

      const emailInput = screen.getByLabelText(/EMAIL/i);
      const submitButton = screen.getByTestId("reset-password-button");

      fireEvent.change(emailInput, { target: { value: "test@example.com" } });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(mockAuthContext.handleResetPassword).toHaveBeenCalledWith(
          "test@example.com"
        );
        expect(
          screen.getByText(
            /Password reset instructions have been sent to your email/i
          )
        ).toBeInTheDocument();
      });
    });

    it.skip("shows error message on failed request", async () => {
      mockAuthContext.handleResetPassword.mockRejectedValueOnce({
        type: ERROR_TYPES.BAD_REQUEST,
        message: "Failed to send reset email. Please try again later.",
      });

      render(<ResetPasswordPage />);

      const emailInput = screen.getByLabelText(/EMAIL/i);
      const submitButton = screen.getByTestId("reset-password-button");

      fireEvent.change(emailInput, { target: { value: "test@example.com" } });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(mockAuthContext.handleResetPassword).toHaveBeenCalledWith(
          "test@example.com"
        );

        const errorContainer = screen.getByTestId("api-error");
        expect(errorContainer).toBeInTheDocument();
      });
    });

    it.skip("handles network errors during form submission", async () => {
      mockAuthContext.handleResetPassword.mockRejectedValueOnce({
        type: ERROR_TYPES.NETWORK_ERROR,
        message: "Network error. Please check your connection and try again.",
      });

      render(<ResetPasswordPage />);

      const emailInput = screen.getByLabelText(/EMAIL/i);
      const submitButton = screen.getByTestId("reset-password-button");

      fireEvent.change(emailInput, { target: { value: "test@example.com" } });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(mockAuthContext.handleResetPassword).toHaveBeenCalledWith(
          "test@example.com"
        );

        // Check for error container's presence without checking specific text
        const errorContainer = screen.getByTestId("api-error");
        expect(errorContainer).toBeInTheDocument();
      });
    });

    it("prevents multiple form submissions", async () => {
      // Mock a delayed reset password function
      mockAuthContext.handleResetPassword.mockImplementationOnce(
        () =>
          new Promise((resolve) =>
            setTimeout(() => resolve({ message: "Success" }), 500)
          )
      );

      render(<ResetPasswordPage />);

      const emailInput = screen.getByLabelText(/EMAIL/i);
      const submitButton = screen.getByTestId("reset-password-button");

      fireEvent.change(emailInput, { target: { value: "test@example.com" } });

      // Click multiple times
      fireEvent.click(submitButton);
      fireEvent.click(submitButton);
      fireEvent.click(submitButton);

      await waitFor(() => {
        // Should only be called once
        expect(mockAuthContext.handleResetPassword).toHaveBeenCalledTimes(1);
      });
    });
  });

  describe("Password Reset Confirmation Page", () => {
    beforeEach(() => {
      // Set up window location and searchParams for token
      Object.defineProperty(window, "location", {
        value: {
          ...originalWindowLocation,
          hash: "#access_token=test-token",
          pathname: "/reset_password/confirm",
          search: "?token=test-token&email=test@example.com",
          assign: jest.fn(),
        },
        writable: true,
        configurable: true,
      });
    });

    it("renders the password reset confirmation form", () => {
      render(<ConfirmResetPage />);

      expect(screen.getByLabelText(/EMAIL/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/NEW PASSWORD/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/CONFIRM PASSWORD/i)).toBeInTheDocument();
      expect(screen.getByTestId("confirm-reset-button")).toBeInTheDocument();
    });

    it("redirects and sets TOKEN_EXPIRED error if token is missing", () => {
      // Mock missing token
      mockSearchParams.get.mockImplementation(() => null);
      mockSearchParams.has.mockReturnValue(false);

      Object.defineProperty(window, "location", {
        value: {
          ...originalWindowLocation,
          hash: "",
          search: "",
        },
        writable: true,
      });

      render(<ConfirmResetPage />);

      // Should redirect to reset password page
      expect(mockRouter.push).toHaveBeenCalledWith("/reset_password");
    });

    it("validates all required fields on submit", async () => {
      render(<ConfirmResetPage />);

      // Submit with empty fields
      const submitButton = screen.getByTestId("confirm-reset-button");
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/Email is required/i)).toBeInTheDocument();
        expect(screen.getByText(/Password is required/i)).toBeInTheDocument();
      });
    });

    it("validates password requirements", async () => {
      render(<ConfirmResetPage />);

      const emailInput = screen.getByLabelText(/EMAIL/i);
      const passwordInput = screen.getByLabelText(/NEW PASSWORD/i);
      const confirmPasswordInput = screen.getByLabelText(/CONFIRM PASSWORD/i);
      const submitButton = screen.getByTestId("confirm-reset-button");

      fireEvent.change(emailInput, { target: { value: "test@example.com" } });
      fireEvent.change(passwordInput, { target: { value: "weak" } });
      fireEvent.change(confirmPasswordInput, { target: { value: "weak" } });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(
          screen.getAllByText(/Password must be at least 8 characters/i)[1]
        ).toBeInTheDocument();
      });
    });

    it("validates passwords match", async () => {
      render(<ConfirmResetPage />);

      const emailInput = screen.getByLabelText(/EMAIL/i);
      const passwordInput = screen.getByLabelText(/NEW PASSWORD/i);
      const confirmPasswordInput = screen.getByLabelText(/CONFIRM PASSWORD/i);
      const submitButton = screen.getByTestId("confirm-reset-button");

      fireEvent.change(emailInput, { target: { value: "test@example.com" } });
      fireEvent.change(passwordInput, {
        target: { value: "StrongPassword123!" },
      });
      fireEvent.change(confirmPasswordInput, {
        target: { value: "DifferentPassword123!" },
      });

      // Click the button to trigger validation
      fireEvent.click(submitButton);

      // Wait for the "Passwords do not match" error to appear
      await waitFor(() => {
        expect(
          screen.getAllByText(/Passwords do not match/i).length
        ).toBeGreaterThan(0);
      });

      // Validation should prevent the API call
      expect(mockAuthContext.handleResetPasswordConfirm).not.toHaveBeenCalled();
    });

    it("submits the form successfully", async () => {
      // Mock successful password reset confirmation
      mockAuthContext.handleResetPasswordConfirm.mockResolvedValueOnce({
        message: "Password has been reset successfully",
      });

      render(<ConfirmResetPage />);

      const emailInput = screen.getByLabelText(/EMAIL/i);
      const passwordInput = screen.getByLabelText(/NEW PASSWORD/i);
      const confirmPasswordInput = screen.getByLabelText(/CONFIRM PASSWORD/i);
      const submitButton = screen.getByTestId("confirm-reset-button");

      fireEvent.change(emailInput, { target: { value: "test@example.com" } });
      fireEvent.change(passwordInput, {
        target: { value: "StrongPassword123!" },
      });
      fireEvent.change(confirmPasswordInput, {
        target: { value: "StrongPassword123!" },
      });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(mockAuthContext.handleResetPasswordConfirm).toHaveBeenCalledWith(
          {
            email: "test@example.com",
            password: "StrongPassword123!",
            token: "test-token",
          }
        );
        expect(
          screen.getByText(/Your password has been successfully reset/i)
        ).toBeInTheDocument();
      });
    });

    it("shows error message on failed password reset", async () => {
      // Mock failed password reset confirmation
      mockAuthContext.handleResetPasswordConfirm.mockRejectedValueOnce({
        message: "Invalid token",
      });

      render(<ConfirmResetPage />);

      const emailInput = screen.getByLabelText(/EMAIL/i);
      const passwordInput = screen.getByLabelText(/NEW PASSWORD/i);
      const confirmPasswordInput = screen.getByLabelText(/CONFIRM PASSWORD/i);
      const submitButton = screen.getByTestId("confirm-reset-button");

      fireEvent.change(emailInput, { target: { value: "test@example.com" } });
      fireEvent.change(passwordInput, {
        target: { value: "StrongPassword123!" },
      });
      fireEvent.change(confirmPasswordInput, {
        target: { value: "StrongPassword123!" },
      });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(mockAuthContext.handleResetPasswordConfirm).toHaveBeenCalled();
        expect(screen.getByTestId("api-error")).toBeInTheDocument();
      });
    });

    it("handles token extracted from URL hash", async () => {
      // Set hash with token but not search params
      Object.defineProperty(window, "location", {
        value: {
          ...originalWindowLocation,
          hash: "#access_token=hash-token",
          search: "",
          pathname: "/reset_password/confirm",
        },
        writable: true,
      });

      // Mock searchParams to not return token
      mockSearchParams.get.mockImplementation(() => null);
      mockSearchParams.has.mockReturnValue(false);

      mockAuthContext.handleResetPasswordConfirm.mockResolvedValueOnce({
        message: "Password has been reset successfully",
      });

      render(<ConfirmResetPage />);

      const emailInput = screen.getByLabelText(/EMAIL/i);
      const passwordInput = screen.getByLabelText(/NEW PASSWORD/i);
      const confirmPasswordInput = screen.getByLabelText(/CONFIRM PASSWORD/i);
      const submitButton = screen.getByTestId("confirm-reset-button");

      fireEvent.change(emailInput, { target: { value: "test@example.com" } });
      fireEvent.change(passwordInput, {
        target: { value: "StrongPassword123!" },
      });
      fireEvent.change(confirmPasswordInput, {
        target: { value: "StrongPassword123!" },
      });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(mockAuthContext.handleResetPasswordConfirm).toHaveBeenCalledWith(
          {
            email: "test@example.com",
            password: "StrongPassword123!",
            token: "hash-token",
          }
        );
      });
    });

    it("prevents multiple form submissions on confirmation page", async () => {
      // Mock a delayed reset password confirmation
      mockAuthContext.handleResetPasswordConfirm.mockImplementationOnce(
        () =>
          new Promise((resolve) =>
            setTimeout(() => resolve({ message: "Success" }), 500)
          )
      );

      render(<ConfirmResetPage />);

      const emailInput = screen.getByLabelText(/EMAIL/i);
      const passwordInput = screen.getByLabelText(/NEW PASSWORD/i);
      const confirmPasswordInput = screen.getByLabelText(/CONFIRM PASSWORD/i);
      const submitButton = screen.getByTestId("confirm-reset-button");

      fireEvent.change(emailInput, { target: { value: "test@example.com" } });
      fireEvent.change(passwordInput, {
        target: { value: "StrongPassword123!" },
      });
      fireEvent.change(confirmPasswordInput, {
        target: { value: "StrongPassword123!" },
      });

      // Click multiple times
      fireEvent.click(submitButton);
      fireEvent.click(submitButton);
      fireEvent.click(submitButton);

      await waitFor(() => {
        // Should only be called once
        expect(
          mockAuthContext.handleResetPasswordConfirm
        ).toHaveBeenCalledTimes(1);
      });
    });

    it("displays success message and login link after successful reset", async () => {
      mockAuthContext.handleResetPasswordConfirm.mockResolvedValueOnce({
        message: "Password has been reset successfully",
      });

      render(<ConfirmResetPage />);

      const emailInput = screen.getByLabelText(/EMAIL/i);
      const passwordInput = screen.getByLabelText(/NEW PASSWORD/i);
      const confirmPasswordInput = screen.getByLabelText(/CONFIRM PASSWORD/i);
      const submitButton = screen.getByTestId("confirm-reset-button");

      fireEvent.change(emailInput, { target: { value: "test@example.com" } });
      fireEvent.change(passwordInput, {
        target: { value: "StrongPassword123!" },
      });
      fireEvent.change(confirmPasswordInput, {
        target: { value: "StrongPassword123!" },
      });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(
          screen.getByText(/Your password has been successfully reset/i)
        ).toBeInTheDocument();
        expect(screen.getByText(/Back/i)).toBeInTheDocument();
      });
    });
  });

  // Edge case tests
  describe("Edge Cases", () => {
    it("handles empty email in reset request page", async () => {
      render(<ResetPasswordPage />);

      const submitButton = screen.getByTestId("reset-password-button");
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/Email is required/i)).toBeInTheDocument();
      });
      expect(mockAuthContext.handleResetPassword).not.toHaveBeenCalled();
    });

    it("handles special characters in email input", async () => {
      mockAuthContext.handleResetPassword.mockResolvedValueOnce({
        message: "Password reset instructions sent",
      });

      render(<ResetPasswordPage />);

      const emailInput = screen.getByLabelText(/EMAIL/i);
      const submitButton = screen.getByTestId("reset-password-button");

      fireEvent.change(emailInput, {
        target: { value: "test+special@example.com" },
      });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(mockAuthContext.handleResetPassword).toHaveBeenCalledWith(
          "test+special@example.com"
        );
      });
    });

    it("handles extremely long passwords", async () => {
      mockAuthContext.handleResetPasswordConfirm.mockResolvedValueOnce({
        message: "Password has been reset successfully",
      });

      render(<ConfirmResetPage />);

      const emailInput = screen.getByLabelText(/EMAIL/i);
      const passwordInput = screen.getByLabelText(/NEW PASSWORD/i);
      const confirmPasswordInput = screen.getByLabelText(/CONFIRM PASSWORD/i);
      const submitButton = screen.getByTestId("confirm-reset-button");

      const longPassword = "StrongPassword123!".repeat(10); // Very long password

      fireEvent.change(emailInput, { target: { value: "test@example.com" } });
      fireEvent.change(passwordInput, { target: { value: longPassword } });
      fireEvent.change(confirmPasswordInput, {
        target: { value: longPassword },
      });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(mockAuthContext.handleResetPasswordConfirm).toHaveBeenCalledWith(
          {
            email: "test@example.com",
            password: longPassword,
            token: "test-token",
          }
        );
      });
    });

    it.skip("handles unexpected errors gracefully", async () => {
      // Mock unexpected error
      mockAuthContext.handleResetPassword.mockRejectedValueOnce({
        type: ERROR_TYPES.UNKNOWN_ERROR,
        message: "An unexpected error occurred. Please try again.",
      });

      render(<ResetPasswordPage />);

      const emailInput = screen.getByTestId("email-field");
      const submitButton = screen.getByTestId("reset-password-button");

      fireEvent.change(emailInput, { target: { value: "test@example.com" } });
      fireEvent.click(submitButton);

      await waitFor(() => {
        const errorContainer = screen.getByTestId("api-error");
        expect(errorContainer).toBeInTheDocument();
        expect(mockAuthContext.handleResetPassword).toHaveBeenCalled();
      });
    });

    it("handles expired tokens", async () => {
      // Mock expired token error
      mockAuthContext.handleResetPasswordConfirm.mockRejectedValueOnce({
        message: "Token has expired",
        type: ERROR_TYPES.TOKEN_EXPIRED,
      });

      render(<ConfirmResetPage />);

      const emailInput = screen.getByLabelText(/EMAIL/i);
      const passwordInput = screen.getByLabelText(/NEW PASSWORD/i);
      const confirmPasswordInput = screen.getByLabelText(/CONFIRM PASSWORD/i);
      const submitButton = screen.getByTestId("confirm-reset-button");

      fireEvent.change(emailInput, { target: { value: "test@example.com" } });
      fireEvent.change(passwordInput, {
        target: { value: "StrongPassword123!" },
      });
      fireEvent.change(confirmPasswordInput, {
        target: { value: "StrongPassword123!" },
      });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByTestId("api-error")).toBeInTheDocument();
        expect(mockAuthContext.handleResetPasswordConfirm).toHaveBeenCalledWith(
          {
            email: "test@example.com",
            password: "StrongPassword123!",
            token: "test-token",
          }
        );
      });
    });
  });
});
