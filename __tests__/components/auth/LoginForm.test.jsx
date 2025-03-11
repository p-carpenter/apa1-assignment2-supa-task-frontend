import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { useRouter } from "next/navigation";
import LoginForm from "@/app/components/auth/LoginForm";
import { useAuth } from "@/app/contexts/AuthContext";

// Mock dependencies
jest.mock("next/navigation", () => ({
  useRouter: jest.fn(),
}));

jest.mock("@/app/contexts/AuthContext", () => ({
  useAuth: jest.fn(),
}));

describe("LoginForm", () => {
  const mockLogin = jest.fn();
  const mockPush = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();

    // Setup router mock
    useRouter.mockReturnValue({
      push: mockPush,
    });

    // Setup auth context mock
    useAuth.mockReturnValue({
      login: mockLogin,
      loading: false,
    });
  });

  it("renders the login form correctly", () => {
    render(<LoginForm />);

    expect(screen.getByLabelText(/EMAIL/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/PASSWORD/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /LOGIN/i })).toBeInTheDocument();
  });

  it("validates required fields on submission", async () => {
    render(<LoginForm />);

    // Submit without filling form
    const submitButton = screen.getByRole("button", { name: /LOGIN/i });
    fireEvent.click(submitButton);

    // Should show validation errors
    await waitFor(() => {
      expect(screen.getByText(/email is required/i)).toBeInTheDocument();
      expect(screen.getByText(/password is required/i)).toBeInTheDocument();
    });

    // Login should not be called
    expect(mockLogin).not.toHaveBeenCalled();
  });

  it("validates email format", async () => {
    render(<LoginForm />);

    // Fill with invalid email
    const emailInput = screen.getByLabelText(/EMAIL/i);
    const passwordInput = screen.getByLabelText(/PASSWORD/i);

    fireEvent.change(emailInput, { target: { value: "invalid-email" } });
    fireEvent.change(passwordInput, { target: { value: "password123" } });

    // Submit form
    const submitButton = screen.getByRole("button", { name: /LOGIN/i });
    fireEvent.click(submitButton);

    // Should show email validation error
    await waitFor(() => {
      expect(screen.getByText(/invalid email address/i)).toBeInTheDocument();
    });

    // Login should not be called
    expect(mockLogin).not.toHaveBeenCalled();
  });

  it("calls login function with correct credentials", async () => {
    // Setup successful login
    mockLogin.mockResolvedValue({ user: { id: "123" } });

    render(<LoginForm />);

    // Fill form with valid data
    const emailInput = screen.getByLabelText(/EMAIL/i);
    const passwordInput = screen.getByLabelText(/PASSWORD/i);

    fireEvent.change(emailInput, { target: { value: "test@example.com" } });
    fireEvent.change(passwordInput, { target: { value: "password123" } });

    // Submit form
    const submitButton = screen.getByRole("button", { name: /LOGIN/i });
    fireEvent.click(submitButton);

    // Login should be called with correct credentials
    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith({
        email: "test@example.com",
        password: "password123",
      });
    });

    // Should redirect after successful login
    expect(mockPush).toHaveBeenCalledWith("/profile");
  });

  it("displays error message when login fails", async () => {
    // Setup failed login
    const errorMessage = "Invalid email or password";
    mockLogin.mockRejectedValue(new Error(errorMessage));

    render(<LoginForm />);

    // Fill form with valid data
    const emailInput = screen.getByLabelText(/EMAIL/i);
    const passwordInput = screen.getByLabelText(/PASSWORD/i);

    fireEvent.change(emailInput, { target: { value: "test@example.com" } });
    fireEvent.change(passwordInput, { target: { value: "wrong-password" } });

    // Submit form
    const submitButton = screen.getByRole("button", { name: /LOGIN/i });
    fireEvent.click(submitButton);

    // Should show error message
    await waitFor(() => {
      expect(screen.getByText(errorMessage)).toBeInTheDocument();
    });

    // Should not redirect
    expect(mockPush).not.toHaveBeenCalled();
  });

  it("disables the submit button while loading", async () => {
    // Setup loading state
    useAuth.mockReturnValue({
      login: mockLogin,
      loading: true,
    });

    render(<LoginForm />);

    // Submit button should be disabled
    const submitButton = screen.getByRole("button", { name: /log in/i });
    expect(submitButton).toBeDisabled();
  });
});
