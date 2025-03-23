import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { ResetPasswordForm } from "@/app/components/forms";

jest.mock("next/link", () => {
  return ({ children, href }) => {
    return (
      <a href={href} className="auth-link">
        {children}
      </a>
    );
  };
});

describe("ResetPasswordForm", () => {
  // Mock props to simulate the props passed from ResetPasswordPage
  const mockProps = {
    formData: {
      email: "",
    },
    formErrors: {},
    handleChange: jest.fn(),
    handleSubmit: jest.fn((e) => e.preventDefault()),
    isSubmitting: false,
    apiError: null,
    buttonText: "SEND RESET LINK",
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders the reset password form correctly", () => {
    render(<ResetPasswordForm {...mockProps} />);

    expect(screen.getByLabelText(/EMAIL/i)).toBeInTheDocument();
    expect(screen.getByTestId("reset-password-button")).toBeInTheDocument();
    expect(screen.getByText("SEND RESET LINK")).toBeInTheDocument();
  });

  it("calls handleChange when email input changes", () => {
    render(<ResetPasswordForm {...mockProps} />);

    const emailInput = screen.getByLabelText(/EMAIL/i);
    fireEvent.change(emailInput, { target: { value: "test@example.com" } });

    expect(mockProps.handleChange).toHaveBeenCalled();
  });

  it("calls handleSubmit when form is submitted", () => {
    render(<ResetPasswordForm {...mockProps} />);

    const form = screen.getByTestId("form");
    fireEvent.submit(form);

    expect(mockProps.handleSubmit).toHaveBeenCalled();
  });

  it("displays form errors when provided", () => {
    const propsWithErrors = {
      ...mockProps,
      formErrors: {
        email: "Email is required.",
      },
    };

    render(<ResetPasswordForm {...propsWithErrors} />);

    expect(screen.getByText("Email is required.")).toBeInTheDocument();
  });

  it("displays API error when provided", () => {
    const propsWithApiError = {
      ...mockProps,
      apiError: {
        type: "invalid_email",
        message: "Invalid email address",
        details: "Invalid email address",
      },
    };

    render(<ResetPasswordForm {...propsWithApiError} />);

    expect(screen.getByText("Invalid email address")).toBeInTheDocument();
  });

  it("disables form elements when isSubmitting is true", () => {
    const propsWhileSubmitting = {
      ...mockProps,
      isSubmitting: true,
    };

    render(<ResetPasswordForm {...propsWhileSubmitting} />);

    expect(screen.getByLabelText(/EMAIL/i)).toBeDisabled();
    expect(screen.getByTestId("reset-password-button")).toBeDisabled();
    expect(screen.getByText("PROCESSING...")).toBeInTheDocument();
  });

  it("allows custom button text to be provided", () => {
    const propsWithCustomButtonText = {
      ...mockProps,
      buttonText: "RESET MY PASSWORD",
    };

    render(<ResetPasswordForm {...propsWithCustomButtonText} />);

    expect(screen.getByText("RESET MY PASSWORD")).toBeInTheDocument();
  });

  it("shows processing text when submitting", () => {
    const propsWhileSubmitting = {
      ...mockProps,
      isSubmitting: true,
    };

    render(<ResetPasswordForm {...propsWhileSubmitting} />);

    expect(screen.getByText("PROCESSING...")).toBeInTheDocument();
    expect(screen.queryByText("SEND RESET LINK")).not.toBeInTheDocument();
  });

  it("sets noValidate on the form", () => {
    render(<ResetPasswordForm {...mockProps} />);

    const form = screen.getByTestId("form");
    expect(form).toHaveAttribute("noValidate");
  });

  it("sets email input as required", () => {
    render(<ResetPasswordForm {...mockProps} />);

    const emailInput = screen.getByPlaceholderText("user@example.com");
    expect(emailInput).toHaveAttribute("required");
  });

  it("properly handles placeholders for email input", () => {
    render(<ResetPasswordForm {...mockProps} />);

    const emailInput = screen.getByLabelText(/EMAIL/i);
    expect(emailInput).toHaveAttribute("placeholder", "user@example.com");
  });

  it("properly sets autocomplete for email input", () => {
    render(<ResetPasswordForm {...mockProps} />);

    const emailInput = screen.getByLabelText(/EMAIL/i);
    expect(emailInput).toHaveAttribute("autocomplete", "email");
  });
});
