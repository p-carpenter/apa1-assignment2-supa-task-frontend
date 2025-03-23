import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import SignupForm from "@/app/components/forms/SignupForm";

// No need to mock useRouter or useAuth since we're mocking all props
// following the pattern from LoginForm.test.jsx

jest.mock("next/link", () => {
  return ({ children, href }) => {
    return (
      <a href={href} className="auth-link">
        {children}
      </a>
    );
  };
});

describe("SignupForm", () => {
  // Mock props to simulate the props passed from SignupPage
  const mockProps = {
    formData: {
      email: "",
      password: "",
      confirmPassword: "",
    },
    formErrors: {},
    handleChange: jest.fn(),
    handleSubmit: jest.fn((e) => e.preventDefault()),
    isSubmitting: false,
    apiError: null,
    passwordRequirements: [],
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders the signup form correctly", () => {
    render(<SignupForm {...mockProps} />);

    expect(screen.getByText("Register for archive access")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("your@email.com")).toBeInTheDocument();

    expect(screen.getByPlaceholderText("••••••••")).toBeInTheDocument();
    expect(
      screen.getByPlaceholderText("Re-enter password")
    ).toBeInTheDocument();
    expect(screen.getByTestId("signup-button")).toBeInTheDocument();
  });

  it("calls handleChange when inputs change", () => {
    render(<SignupForm {...mockProps} />);

    const emailInput = screen.getByPlaceholderText("your@email.com");
    fireEvent.change(emailInput, { target: { value: "test@example.com" } });

    const passwordInput = screen.getByPlaceholderText("••••••••");
    fireEvent.change(passwordInput, { target: { value: "Password123!" } });

    const confirmPasswordInput =
      screen.getByPlaceholderText("Re-enter password");
    fireEvent.change(confirmPasswordInput, {
      target: { value: "Password123!" },
    });

    expect(mockProps.handleChange).toHaveBeenCalledTimes(3);
  });

  it("calls handleSubmit when form is submitted", () => {
    render(<SignupForm {...mockProps} />);

    const form = screen.getByTestId("signup-button").closest("form");
    fireEvent.submit(form);

    expect(mockProps.handleSubmit).toHaveBeenCalled();
  });

  it("displays form errors when provided", () => {
    const propsWithErrors = {
      ...mockProps,
      formErrors: {
        email: "Email is required.",
        password: "Password must be at least 8 characters long.",
        confirmPassword: "Passwords do not match.",
      },
    };

    render(<SignupForm {...propsWithErrors} />);

    expect(screen.getByText("Email is required.")).toBeInTheDocument();
    expect(
      screen.getByText("Password must be at least 8 characters long.")
    ).toBeInTheDocument();
    expect(screen.getByText("Passwords do not match.")).toBeInTheDocument();
  });

  it("displays password requirements helper text", () => {
    render(<SignupForm {...mockProps} />);

    expect(
      screen.getByText(
        "Password must be at least 8 characters and include one number, one special character, and one uppercase letter."
      )
    ).toBeInTheDocument();
  });

  it("displays API error when provided", () => {
    const propsWithApiError = {
      ...mockProps,
      apiError: {
        type: "email_already_exists",
        message: "An account with this email already exists",
        details: "Email already in use",
      },
    };

    render(<SignupForm {...propsWithApiError} />);

    expect(screen.getByText("Email already in use")).toBeInTheDocument();
  });

  it("disables form elements when isSubmitting is true", () => {
    const propsWhileSubmitting = {
      ...mockProps,
      formData: {
        email: "test@example.com",
        password: "Password123!",
        confirmPassword: "Password123!",
      },
      isSubmitting: true,
    };

    render(<SignupForm {...propsWhileSubmitting} />);

    const emailInput = screen.getByPlaceholderText("your@email.com");
    const passwordInput = screen.getByPlaceholderText("••••••••");
    const confirmPasswordInput =
      screen.getByPlaceholderText("Re-enter password");

    expect(emailInput).toBeDisabled();
    expect(emailInput).toHaveValue("test@example.com");
    expect(passwordInput).toBeDisabled();
    expect(passwordInput).toHaveValue("Password123!");
    expect(confirmPasswordInput).toBeDisabled();
    expect(confirmPasswordInput).toHaveValue("Password123!");
    expect(screen.getByTestId("signup-button")).toBeDisabled();
    expect(screen.getByText("REGISTERING...")).toBeInTheDocument();
  });

  it("shows link to login page", () => {
    render(<SignupForm {...mockProps} />);

    const loginLink = screen.getByText("Login here");
    expect(loginLink).toBeInTheDocument();
    expect(loginLink.closest("a")).toHaveAttribute("href", "/login");
  });

  it("renders with prefilled form data", () => {
    const propsWithData = {
      ...mockProps,
      formData: {
        email: "test@example.com",
        password: "Password123!",
        confirmPassword: "Password123!",
      },
    };

    render(<SignupForm {...propsWithData} />);

    expect(screen.getByPlaceholderText("your@email.com")).toHaveValue(
      "test@example.com"
    );
    expect(screen.getByPlaceholderText("••••••••")).toHaveValue("Password123!");
    expect(screen.getByPlaceholderText("Re-enter password")).toHaveValue(
      "Password123!"
    );
  });
});
