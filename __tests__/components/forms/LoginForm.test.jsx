import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { useRouter } from "next/navigation";
import { LoginForm } from "@/app/components/forms";
import { useAuth } from "@/app/contexts/AuthContext.jsx";

jest.mock("next/navigation", () => ({
  useRouter: jest.fn(),
}));

jest.mock("@/app/contexts/AuthContext", () => ({
  useAuth: jest.fn(),
}));

jest.mock("next/link", () => {
  return ({ children, href }) => {
    return (
      <a href={href} className="auth-link">
        {children}
      </a>
    );
  };
});

describe("LoginForm", () => {
  const mockLogin = jest.fn();
  const mockPush = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();

    useRouter.mockReturnValue({
      push: mockPush,
    });

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

    const emailInput = screen.getByLabelText(/EMAIL/i);
    const passwordInput = screen.getByLabelText(/PASSWORD/i);

    fireEvent.change(emailInput, { target: { value: "" } });
    fireEvent.change(passwordInput, { target: { value: "" } });

    const submitButton = screen.getByRole("button", { name: /LOGIN/i });
    fireEvent.click(submitButton);

    expect(screen.getByText("Email is required.")).toBeInTheDocument();

    fireEvent.change(emailInput, { target: { value: "test@example.com" } });
    fireEvent.click(submitButton);

    expect(screen.getByText("Password is required.")).toBeInTheDocument();

    expect(mockLogin).not.toHaveBeenCalled();
  });

  it("validates email format", async () => {
    render(<LoginForm />);

    const emailInput = screen.getByLabelText(/EMAIL/i);
    const passwordInput = screen.getByLabelText(/PASSWORD/i);

    fireEvent.change(emailInput, { target: { value: "invalid-email" } });
    fireEvent.change(passwordInput, { target: { value: "Password1!" } });

    const submitButton = screen.getByRole("button", { name: /LOGIN/i });
    fireEvent.click(submitButton);

    expect(
      screen.getByText("Please enter a valid email address.")
    ).toBeInTheDocument();

    expect(mockLogin).not.toHaveBeenCalled();
  });

  it("calls login function with correct credentials", async () => {
    mockLogin.mockResolvedValue({ user: { id: "123" } });

    render(<LoginForm />);

    const emailInput = screen.getByLabelText(/EMAIL/i);
    const passwordInput = screen.getByLabelText(/PASSWORD/i);

    fireEvent.change(emailInput, { target: { value: "test@example.com" } });
    fireEvent.change(passwordInput, { target: { value: "Password123!" } });

    const submitButton = screen.getByRole("button", { name: /LOGIN/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith({
        email: "test@example.com",
        password: "Password123!",
      });
    });
  });

  it("displays error message when login fails", async () => {
    const errorMessage = "Invalid email or password";
    mockLogin.mockRejectedValue(new Error(errorMessage));

    render(<LoginForm />);

    const emailInput = screen.getByLabelText(/EMAIL/i);
    const passwordInput = screen.getByLabelText(/PASSWORD/i);

    fireEvent.change(emailInput, { target: { value: "test@example.com" } });
    fireEvent.change(passwordInput, { target: { value: "Password123!" } });

    const submitButton = screen.getByRole("button", { name: /LOGIN/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(errorMessage)).toBeInTheDocument();
    });
  });

  it("disables the submit button while loading", () => {
    useAuth.mockReturnValue({
      login: mockLogin,
      loading: true,
    });

    render(<LoginForm />);

    const submitButton = screen.getByTestId("login-button");

    expect(submitButton).toBeDisabled();

    expect(submitButton).toHaveTextContent("AUTHENTICATING...");
  });

  it("validates password number requirement", async () => {
    render(<LoginForm />);

    const emailInput = screen.getByLabelText(/EMAIL/i);
    const passwordInput = screen.getByLabelText(/PASSWORD/i);

    fireEvent.change(emailInput, { target: { value: "test@example.com" } });
    fireEvent.change(passwordInput, { target: { value: "Password!" } });

    const submitButton = screen.getByRole("button", { name: /LOGIN/i });
    fireEvent.click(submitButton);

    expect(
      screen.getByText("Password must contain at least one number.")
    ).toBeInTheDocument();

    expect(mockLogin).not.toHaveBeenCalled();
  });

  it("validates password uppercase requirement", async () => {
    render(<LoginForm />);

    const emailInput = screen.getByLabelText(/EMAIL/i);
    const passwordInput = screen.getByLabelText(/PASSWORD/i);

    fireEvent.change(emailInput, { target: { value: "test@example.com" } });
    fireEvent.change(passwordInput, { target: { value: "password1!" } });

    const submitButton = screen.getByRole("button", { name: /LOGIN/i });
    fireEvent.click(submitButton);

    expect(
      screen.getByText("Password must contain at least one uppercase letter.")
    ).toBeInTheDocument();

    expect(mockLogin).not.toHaveBeenCalled();
  });

  it("validates password special character requirement", async () => {
    render(<LoginForm />);

    const emailInput = screen.getByLabelText(/EMAIL/i);
    const passwordInput = screen.getByLabelText(/PASSWORD/i);

    fireEvent.change(emailInput, { target: { value: "test@example.com" } });
    fireEvent.change(passwordInput, { target: { value: "Password1" } });

    const submitButton = screen.getByRole("button", { name: /LOGIN/i });
    fireEvent.click(submitButton);

    expect(
      screen.getByText("Password must contain at least one special character.")
    ).toBeInTheDocument();

    expect(mockLogin).not.toHaveBeenCalled();
  });

  it("validates password length requirement", async () => {
    render(<LoginForm />);

    const emailInput = screen.getByLabelText(/EMAIL/i);
    const passwordInput = screen.getByLabelText(/PASSWORD/i);

    fireEvent.change(emailInput, { target: { value: "test@example.com" } });
    fireEvent.change(passwordInput, { target: { value: "P1!" } });

    const submitButton = screen.getByRole("button", { name: /LOGIN/i });
    fireEvent.click(submitButton);

    expect(
      screen.getByText("Password must be at least 8 characters long.")
    ).toBeInTheDocument();

    expect(mockLogin).not.toHaveBeenCalled();
  });
});
