import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { useRouter } from "next/navigation";
import SignupForm from "@/app/components/forms/SignupForm";
import { useAuth } from "@/app/contexts/AuthContext.jsx";

jest.mock("next/navigation", () => ({
  useRouter: jest.fn(),
}));

jest.mock("@/app/contexts/AuthContext", () => ({
  useAuth: jest.fn(),
}));

jest.mock("next/link", () => {
  return ({ children, href }) => (
    <a href={href} className="auth-link">
      {children}
    </a>
  );
});

describe("SignupForm", () => {
  const mockRegister = jest.fn();
  const mockPush = jest.fn();

  let emailInput, passwordInput, confirmPasswordInput, submitButton;

  beforeEach(() => {
    jest.clearAllMocks();

    useRouter.mockReturnValue({ push: mockPush });
    useAuth.mockReturnValue({ register: mockRegister });

    render(<SignupForm />);

    // Initialize form elements for all tests
    emailInput = screen.getByRole("textbox", { name: /\$ email/i });
    passwordInput = screen.getByLabelText(/\$ password/i);
    confirmPasswordInput = screen.getByLabelText(/\$ confirm password/i);
    submitButton = screen.getByRole("button", { name: /create account/i });
  });

  it("renders the signup form correctly", () => {
    expect(
      screen.getByRole("heading", { name: /create account/i })
    ).toBeInTheDocument();
    expect(emailInput).toBeInTheDocument();
    expect(passwordInput).toBeInTheDocument();
    expect(confirmPasswordInput).toBeInTheDocument();
    expect(submitButton).toBeInTheDocument();
  });

  it("validates required fields on submission", async () => {
    fireEvent.click(submitButton);

    expect(screen.getByText("Email is required.")).toBeInTheDocument();
    expect(screen.getByText("Password is required.")).toBeInTheDocument();
    expect(
      screen.getByText("Please confirm your password.")
    ).toBeInTheDocument();
    expect(mockRegister).not.toHaveBeenCalled();
  });

  it("validates email format", async () => {
    fireEvent.change(emailInput, { target: { value: "invalid-email" } });
    fireEvent.click(submitButton);

    expect(
      screen.getByText("Please enter a valid email address.")
    ).toBeInTheDocument();
    expect(mockRegister).not.toHaveBeenCalled();
  });

  it("validates password requirements", async () => {
    fireEvent.change(passwordInput, { target: { value: "short" } });
    fireEvent.click(submitButton);

    expect(
      screen.getByText("Password must be at least 8 characters long.")
    ).toBeInTheDocument();
  });

  it("validates password complexity", async () => {
    fireEvent.change(passwordInput, { target: { value: "password123" } });
    fireEvent.click(submitButton);
    expect(
      screen.getByText("Password must contain at least one special character.")
    ).toBeInTheDocument();

    fireEvent.change(passwordInput, { target: { value: "Password!" } });
    fireEvent.click(submitButton);
    expect(
      screen.getByText("Password must contain at least one number.")
    ).toBeInTheDocument();

    fireEvent.change(passwordInput, { target: { value: "password123!" } });
    fireEvent.click(submitButton);
    expect(
      screen.getByText("Password must contain at least one uppercase letter.")
    ).toBeInTheDocument();
  });

  it("validates password matching", async () => {
    fireEvent.change(passwordInput, { target: { value: "Password123!" } });
    fireEvent.change(confirmPasswordInput, {
      target: { value: "DifferentPassword123!" },
    });

    fireEvent.click(submitButton);

    expect(screen.getByText("Passwords do not match.")).toBeInTheDocument();
    expect(mockRegister).not.toHaveBeenCalled();
  });

  it("validates password matching in real-time", async () => {
    fireEvent.change(passwordInput, { target: { value: "Password123!" } });
    fireEvent.change(confirmPasswordInput, {
      target: { value: "Password123!" },
    });

    expect(
      screen.queryByText("Passwords do not match.")
    ).not.toBeInTheDocument();

    fireEvent.change(passwordInput, { target: { value: "NewPassword123!" } });

    expect(screen.getByText("Passwords do not match.")).toBeInTheDocument();
  });

  it("calls register function with correct credentials", async () => {
    mockRegister.mockResolvedValue({ user: { id: "123" } });

    fireEvent.change(emailInput, { target: { value: "test@example.com" } });
    fireEvent.change(passwordInput, { target: { value: "Password123!" } });
    fireEvent.change(confirmPasswordInput, {
      target: { value: "Password123!" },
    });

    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockRegister).toHaveBeenCalledWith({
        email: "test@example.com",
        password: "Password123!",
        displayName: "test",
      });
    });
  });

  it("displays error message when registration fails", async () => {
    mockRegister.mockRejectedValue(new Error("Email already in use"));

    fireEvent.change(emailInput, { target: { value: "test@example.com" } });
    fireEvent.change(passwordInput, { target: { value: "Password123!" } });
    fireEvent.change(confirmPasswordInput, {
      target: { value: "Password123!" },
    });

    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText("Email already in use")).toBeInTheDocument();
    });
  });

  it("disables form inputs and shows loading state while submitting", async () => {
    mockRegister.mockImplementation(
      () =>
        new Promise((resolve) =>
          setTimeout(() => resolve({ user: { id: "123" } }), 100)
        )
    );

    fireEvent.change(emailInput, { target: { value: "test@example.com" } });
    fireEvent.change(passwordInput, { target: { value: "Password123!" } });
    fireEvent.change(confirmPasswordInput, {
      target: { value: "Password123!" },
    });

    fireEvent.click(submitButton);

    expect(submitButton).toHaveAttribute("disabled");
    expect(emailInput).toHaveAttribute("disabled");
    expect(passwordInput).toHaveAttribute("disabled");
    expect(confirmPasswordInput).toHaveAttribute("disabled");

    await waitFor(() => {
      expect(mockRegister).toHaveBeenCalled();
    });
  });

  it("shows validation errors with proper styling", async () => {
    fireEvent.change(emailInput, { target: { value: "invalid-email" } });
    fireEvent.blur(emailInput);
    expect(emailInput).toHaveClass("input-error");
    expect(screen.getByText("Please enter a valid email address.")).toHaveClass(
      "form-error"
    );

    fireEvent.change(passwordInput, { target: { value: "short" } });
    fireEvent.blur(passwordInput);
    expect(passwordInput).toHaveClass("input-error");
    expect(
      screen.getByText("Password must be at least 8 characters long.")
    ).toHaveClass("form-error");
  });
});
