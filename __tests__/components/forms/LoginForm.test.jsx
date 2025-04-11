import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { LoginForm } from "@/app/components/forms";

// No need to mock useRouter or useAuth since we're mocking all props

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
  // Mock props to simulate the props passed from LoginPage
  const mockProps = {
    formData: {
      email: "",
      password: "",
    },
    formErrors: {},
    handleChange: jest.fn(),
    handleSubmit: jest.fn((e) => e.preventDefault()),
    isSubmitting: false,
    apiError: null,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders the login form correctly", () => {
    render(<LoginForm {...mockProps} />);

    expect(screen.getByLabelText(/EMAIL/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/••••••••/i)).toBeInTheDocument();
    expect(screen.getByTestId("login-button")).toBeInTheDocument();
  });

  it("calls handleChange when inputs change", () => {
    render(<LoginForm {...mockProps} />);

    const emailInput = screen.getByLabelText(/EMAIL/i);
    fireEvent.change(emailInput, { target: { value: "test@example.com" } });

    expect(mockProps.handleChange).toHaveBeenCalled();
  });

  it("calls handleSubmit when form is submitted", () => {
    render(<LoginForm {...mockProps} />);

    const form = screen.getByTestId("form");
    fireEvent.submit(form);

    expect(mockProps.handleSubmit).toHaveBeenCalled();
  });

  it("displays form errors when provided", () => {
    const propsWithErrors = {
      ...mockProps,
      formErrors: {
        email: "Email is required.",
        password: "Password must be at least 8 characters long.",
      },
    };

    render(<LoginForm {...propsWithErrors} />);

    expect(screen.getByText("Email is required.")).toBeInTheDocument();
    expect(
      screen.getByText("Password must be at least 8 characters long.")
    ).toBeInTheDocument();
  });

  it("displays API error when provided", () => {
    const propsWithApiError = {
      ...mockProps,
      apiError: {
        type: "invalid_credentials",
        message: "Invalid credentials",
        details: "Invalid credentials",
      },
    };

    render(<LoginForm {...propsWithApiError} />);

    expect(screen.getByText("Invalid credentials")).toBeInTheDocument();
  });

  it("disables form elements when isSubmitting is true", () => {
    const propsWhileSubmitting = {
      ...mockProps,
      isSubmitting: true,
    };

    render(<LoginForm {...propsWhileSubmitting} />);

    expect(screen.getByLabelText(/EMAIL/i)).toBeDisabled();
    expect(screen.getByPlaceholderText(/••••••••/i)).toBeDisabled();
    expect(screen.getByTestId("login-button")).toBeDisabled();
    expect(screen.getByText("AUTHENTICATING...")).toBeInTheDocument();
  });
});
