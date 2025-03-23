import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/app/contexts/AuthContext";
import LoginPage from "@/app/login/page";
import { processApiError } from "@/app/utils/errors/errorService";

jest.mock("next/navigation", () => ({
  useRouter: jest.fn(),
}));

jest.mock("@/app/contexts/AuthContext", () => ({
  useAuth: jest.fn(),
}));

jest.mock("@/app/utils/errors/errorService", () => ({
  processApiError: jest.fn(),
}));

jest.mock("@/app/components/forms", () => ({
  LoginForm: jest.fn(
    ({
      formData,
      formErrors,
      handleSubmit,
      handleChange,
      isSubmitting,
      apiError,
    }) => (
      <div data-testid="login-form-mock">
        <form onSubmit={handleSubmit} data-testid="login-form">
          <input
            data-testid="email-input"
            name="email"
            value={formData.email}
            onChange={handleChange}
          />
          {formErrors.email && (
            <div data-testid="email-error">{formErrors.email}</div>
          )}

          <input
            data-testid="password-input"
            name="password"
            type="password"
            value={formData.password}
            onChange={handleChange}
          />
          {formErrors.password && (
            <div data-testid="password-error">{formErrors.password}</div>
          )}

          <button
            data-testid="submit-button"
            type="submit"
            disabled={isSubmitting}
          >
            {isSubmitting ? "AUTHENTICATING..." : "LOGIN"}
          </button>

          {apiError && <div data-testid="api-error">{apiError.message}</div>}
        </form>
      </div>
    )
  ),
}));

jest.mock("@/app/components/ui/console", () => ({
  ConsoleWindow: jest.fn(({ children }) => (
    <div data-testid="console-window">{children}</div>
  )),
  ConsoleSection: jest.fn(({ children }) => (
    <div data-testid="console-section">{children}</div>
  )),
  CommandOutput: jest.fn(({ children }) => (
    <div data-testid="command-output">{children}</div>
  )),
}));

describe("LoginPage", () => {
  const mockPush = jest.fn();
  const mockSignIn = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();

    useRouter.mockReturnValue({
      push: mockPush,
    });

    useAuth.mockReturnValue({
      isAuthenticated: false,
      isLoading: false,
      signIn: mockSignIn,
    });

    processApiError.mockImplementation((err) => ({
      message: err.message || "An error occurred",
      code: err.code || "unknown",
    }));
  });

  it("renders the login page with form", () => {
    render(<LoginPage />);

    expect(screen.getByTestId("login-form-mock")).toBeInTheDocument();
    expect(screen.getByTestId("console-window")).toBeInTheDocument();
  });

  it("redirects to profile if already authenticated", async () => {
    useAuth.mockReturnValue({
      isAuthenticated: true,
      isLoading: false,
    });

    const pushMock = jest.fn();
    useRouter.mockReturnValue({
      push: pushMock,
    });

    render(<LoginPage />);

    await waitFor(() => {
      expect(pushMock).toHaveBeenCalledWith("/profile");
    });
  });

  it("doesn't redirect if not authenticated", () => {
    useAuth.mockReturnValue({
      isAuthenticated: false,
      isLoading: false,
    });

    render(<LoginPage />);

    expect(mockPush).not.toHaveBeenCalled();
  });

  it("doesn't redirect while authentication is loading", () => {
    useAuth.mockReturnValue({
      isAuthenticated: false,
      isLoading: true,
    });

    render(<LoginPage />);

    expect(mockPush).not.toHaveBeenCalled();
  });

  it("validates email field on submit", async () => {
    render(<LoginPage />);

    const emailInput = screen.getByTestId("email-input");
    const passwordInput = screen.getByTestId("password-input");
    const form = screen.getByTestId("login-form");

    fireEvent.change(emailInput, {
      target: { name: "email", value: "invalid-email" },
    });
    fireEvent.change(passwordInput, {
      target: { name: "password", value: "ValidPass1!" },
    });
    fireEvent.submit(form);

    await waitFor(() => {
      expect(screen.getByTestId("email-error")).toBeInTheDocument();
      expect(mockSignIn).not.toHaveBeenCalled();
    });
  });

  it("validates empty email field", async () => {
    render(<LoginPage />);

    const emailInput = screen.getByTestId("email-input");
    const passwordInput = screen.getByTestId("password-input");
    const form = screen.getByTestId("login-form");

    fireEvent.change(emailInput, { target: { name: "email", value: "" } });
    fireEvent.change(passwordInput, {
      target: { name: "password", value: "ValidPass1!" },
    });
    fireEvent.submit(form);

    await waitFor(() => {
      expect(screen.getByTestId("email-error")).toBeInTheDocument();
      expect(mockSignIn).not.toHaveBeenCalled();
    });
  });

  it("validates password field on submit - too short", async () => {
    render(<LoginPage />);

    const emailInput = screen.getByTestId("email-input");
    const passwordInput = screen.getByTestId("password-input");
    const form = screen.getByTestId("login-form");

    fireEvent.change(emailInput, {
      target: { name: "email", value: "valid@example.com" },
    });
    fireEvent.change(passwordInput, {
      target: { name: "password", value: "Val1!" },
    });
    fireEvent.submit(form);

    await waitFor(() => {
      expect(screen.getByTestId("password-error")).toBeInTheDocument();
      expect(mockSignIn).not.toHaveBeenCalled();
    });
  });

  it("validates password field on submit - missing uppercase", async () => {
    render(<LoginPage />);

    const emailInput = screen.getByTestId("email-input");
    const passwordInput = screen.getByTestId("password-input");
    const form = screen.getByTestId("login-form");

    fireEvent.change(emailInput, {
      target: { name: "email", value: "valid@example.com" },
    });
    fireEvent.change(passwordInput, {
      target: { name: "password", value: "password1!" },
    });
    fireEvent.submit(form);

    await waitFor(() => {
      expect(screen.getByTestId("password-error")).toBeInTheDocument();
      expect(mockSignIn).not.toHaveBeenCalled();
    });
  });

  it("validates password field on submit - missing number", async () => {
    render(<LoginPage />);

    const emailInput = screen.getByTestId("email-input");
    const passwordInput = screen.getByTestId("password-input");
    const form = screen.getByTestId("login-form");

    fireEvent.change(emailInput, {
      target: { name: "email", value: "valid@example.com" },
    });
    fireEvent.change(passwordInput, {
      target: { name: "password", value: "Password!" },
    });
    fireEvent.submit(form);

    await waitFor(() => {
      expect(screen.getByTestId("password-error")).toBeInTheDocument();
      expect(mockSignIn).not.toHaveBeenCalled();
    });
  });

  it("validates password field on submit - missing special character", async () => {
    render(<LoginPage />);

    const emailInput = screen.getByTestId("email-input");
    const passwordInput = screen.getByTestId("password-input");
    const form = screen.getByTestId("login-form");

    fireEvent.change(emailInput, {
      target: { name: "email", value: "valid@example.com" },
    });
    fireEvent.change(passwordInput, {
      target: { name: "password", value: "Password123" },
    });
    fireEvent.submit(form);

    await waitFor(() => {
      expect(screen.getByTestId("password-error")).toBeInTheDocument();
      expect(mockSignIn).not.toHaveBeenCalled();
    });
  });

  it("validates empty password field", async () => {
    render(<LoginPage />);

    const emailInput = screen.getByTestId("email-input");
    const passwordInput = screen.getByTestId("password-input");
    const form = screen.getByTestId("login-form");

    fireEvent.change(emailInput, {
      target: { name: "email", value: "valid@example.com" },
    });
    fireEvent.change(passwordInput, {
      target: { name: "password", value: "" },
    });
    fireEvent.submit(form);

    await waitFor(() => {
      expect(screen.getByTestId("password-error")).toBeInTheDocument();
      expect(mockSignIn).not.toHaveBeenCalled();
    });
  });

  it("calls signIn with correct data when form is valid", async () => {
    mockSignIn.mockResolvedValue({ success: true });

    render(<LoginPage />);

    const emailInput = screen.getByTestId("email-input");
    const passwordInput = screen.getByTestId("password-input");
    const form = screen.getByTestId("login-form");

    fireEvent.change(emailInput, {
      target: { name: "email", value: "test@example.com" },
    });
    fireEvent.change(passwordInput, {
      target: { name: "password", value: "ValidPass1!" },
    });
    fireEvent.submit(form);

    await waitFor(() => {
      expect(mockSignIn).toHaveBeenCalledWith({
        email: "test@example.com",
        password: "ValidPass1!",
      });
    });
  });

  it("displays API error when signIn fails", async () => {
    const errorMessage = "Invalid email or password";
    mockSignIn.mockRejectedValue(new Error(errorMessage));

    render(<LoginPage />);

    const emailInput = screen.getByTestId("email-input");
    const passwordInput = screen.getByTestId("password-input");
    const form = screen.getByTestId("login-form");

    fireEvent.change(emailInput, {
      target: { name: "email", value: "test@example.com" },
    });
    fireEvent.change(passwordInput, {
      target: { name: "password", value: "ValidPass1!" },
    });
    fireEvent.submit(form);

    await waitFor(() => {
      expect(processApiError).toHaveBeenCalled();
      expect(screen.getByTestId("api-error")).toBeInTheDocument();
    });
  });

  it("correctly processes API errors with custom error service", async () => {
    const errorObj = {
      message: "Auth error",
      code: "auth/invalid-credentials",
    };

    mockSignIn.mockRejectedValue(errorObj);
    processApiError.mockReturnValue({
      message: "User-friendly error message",
      code: "auth/invalid-credentials",
    });

    render(<LoginPage />);

    const emailInput = screen.getByTestId("email-input");
    const passwordInput = screen.getByTestId("password-input");
    const form = screen.getByTestId("login-form");

    fireEvent.change(emailInput, {
      target: { name: "email", value: "test@example.com" },
    });
    fireEvent.change(passwordInput, {
      target: { name: "password", value: "ValidPass1!" },
    });
    fireEvent.submit(form);

    await waitFor(() => {
      expect(processApiError).toHaveBeenCalledWith(errorObj, {
        defaultMessage: "An error occurred during login",
      });
      expect(screen.getByTestId("api-error")).toHaveTextContent(
        "User-friendly error message"
      );
    });
  });

  it("prevents duplicate submissions", async () => {
    mockSignIn.mockImplementation(
      () =>
        new Promise((resolve) =>
          setTimeout(() => resolve({ success: true }), 100)
        )
    );

    render(<LoginPage />);

    const emailInput = screen.getByTestId("email-input");
    const passwordInput = screen.getByTestId("password-input");
    const form = screen.getByTestId("login-form");

    fireEvent.change(emailInput, {
      target: { name: "email", value: "test@example.com" },
    });
    fireEvent.change(passwordInput, {
      target: { name: "password", value: "ValidPass1!" },
    });

    fireEvent.submit(form);
    fireEvent.submit(form);

    await waitFor(() => {
      expect(mockSignIn).toHaveBeenCalledTimes(1);
    });
  });

  it("disables form submission while loading", async () => {
    useAuth.mockReturnValue({
      isAuthenticated: false,
      isLoading: true,
      signIn: mockSignIn,
    });

    render(<LoginPage />);

    const submitButton = screen.getByTestId("submit-button");
    expect(submitButton).toBeDisabled();
    expect(submitButton).toHaveTextContent("AUTHENTICATING...");
  });

  it("resets API error when submitting form again", async () => {
    mockSignIn.mockRejectedValueOnce(new Error("Invalid credentials"));

    render(<LoginPage />);

    const emailInput = screen.getByTestId("email-input");
    const passwordInput = screen.getByTestId("password-input");
    const form = screen.getByTestId("login-form");

    fireEvent.change(emailInput, {
      target: { name: "email", value: "test@example.com" },
    });
    fireEvent.change(passwordInput, {
      target: { name: "password", value: "ValidPass1!" },
    });
    fireEvent.submit(form);

    await waitFor(() => {
      expect(screen.getByTestId("api-error")).toBeInTheDocument();
    });

    mockSignIn.mockResolvedValueOnce({ success: true });

    fireEvent.submit(form);

    await waitFor(() => {
      expect(screen.queryByTestId("api-error")).not.toBeInTheDocument();
    });
  });

  it("cleans up submission state after successful login", async () => {
    mockSignIn.mockResolvedValue({ success: true });

    render(<LoginPage />);

    const emailInput = screen.getByTestId("email-input");
    const passwordInput = screen.getByTestId("password-input");
    const form = screen.getByTestId("login-form");

    fireEvent.change(emailInput, {
      target: { name: "email", value: "test@example.com" },
    });
    fireEvent.change(passwordInput, {
      target: { name: "password", value: "ValidPass1!" },
    });
    fireEvent.submit(form);

    await waitFor(() => {
      expect(mockSignIn).toHaveBeenCalled();

      fireEvent.submit(form);
      expect(mockSignIn).toHaveBeenCalledTimes(2);
    });
  });

  it("cleans up submission state after failed login", async () => {
    mockSignIn.mockRejectedValue(new Error("Invalid credentials"));

    render(<LoginPage />);

    const emailInput = screen.getByTestId("email-input");
    const passwordInput = screen.getByTestId("password-input");
    const form = screen.getByTestId("login-form");

    fireEvent.change(emailInput, {
      target: { name: "email", value: "test@example.com" },
    });
    fireEvent.change(passwordInput, {
      target: { name: "password", value: "ValidPass1!" },
    });
    fireEvent.submit(form);

    await waitFor(() => {
      expect(mockSignIn).toHaveBeenCalled();
      expect(screen.getByTestId("api-error")).toBeInTheDocument();

      fireEvent.submit(form);
      expect(mockSignIn).toHaveBeenCalledTimes(2);
    });
  });
});
