import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { ConfirmResetForm } from "@/app/components/forms";

jest.mock("next/link", () => {
  return ({ children, href }) => {
    return (
      <a href={href} className="auth-link">
        {children}
      </a>
    );
  };
});

describe("ConfirmResetForm", () => {
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
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders the confirm reset password form correctly", () => {
    render(<ConfirmResetForm {...mockProps} />);

    expect(screen.getByLabelText(/EMAIL/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/NEW PASSWORD/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/CONFIRM PASSWORD/i)).toBeInTheDocument();
    expect(screen.getByTestId("confirm-reset-button")).toBeInTheDocument();
    expect(screen.getByText("RESET PASSWORD")).toBeInTheDocument();
  });

  it("calls handleChange when inputs change", () => {
    render(<ConfirmResetForm {...mockProps} />);

    const emailInput = screen.getByLabelText(/EMAIL/i);
    fireEvent.change(emailInput, { target: { value: "test@example.com" } });
    expect(mockProps.handleChange).toHaveBeenCalled();

    const passwordInput = screen.getByLabelText(/NEW PASSWORD/i);
    fireEvent.change(passwordInput, { target: { value: "Password123!" } });
    expect(mockProps.handleChange).toHaveBeenCalled();

    const confirmPasswordInput = screen.getByLabelText(/CONFIRM PASSWORD/i);
    fireEvent.change(confirmPasswordInput, {
      target: { value: "Password123!" },
    });
    expect(mockProps.handleChange).toHaveBeenCalled();
  });

  it("calls handleSubmit when form is submitted", () => {
    render(<ConfirmResetForm {...mockProps} />);

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
        confirmPassword: "Passwords do not match.",
      },
    };

    render(<ConfirmResetForm {...propsWithErrors} />);

    expect(screen.getByText("Email is required.")).toBeInTheDocument();
    expect(
      screen.getByText("Password must be at least 8 characters long.")
    ).toBeInTheDocument();
    expect(screen.getByText("Passwords do not match.")).toBeInTheDocument();
  });

  it("disables form elements when isSubmitting is true", () => {
    const propsWhileSubmitting = {
      ...mockProps,
      isSubmitting: true,
    };

    render(<ConfirmResetForm {...propsWhileSubmitting} />);

    expect(screen.getByLabelText(/EMAIL/i)).toBeDisabled();
    expect(screen.getByLabelText(/NEW PASSWORD/i)).toBeDisabled();
    expect(screen.getByLabelText(/CONFIRM PASSWORD/i)).toBeDisabled();
    expect(screen.getByTestId("confirm-reset-button")).toBeDisabled();
    expect(screen.getByText("PROCESSING...")).toBeInTheDocument();
  });

  it("shows processing text when submitting", () => {
    const propsWhileSubmitting = {
      ...mockProps,
      isSubmitting: true,
    };

    render(<ConfirmResetForm {...propsWhileSubmitting} />);

    expect(screen.getByText("PROCESSING...")).toBeInTheDocument();
    expect(screen.queryByText("RESET PASSWORD")).not.toBeInTheDocument();
  });

  it("sets noValidate on the form", () => {
    render(<ConfirmResetForm {...mockProps} />);

    const form = screen.getByTestId("form");
    expect(form).toHaveAttribute("noValidate");
  });

  it("displays password requirements helper text", () => {
    render(<ConfirmResetForm {...mockProps} />);

    expect(
      screen.getByText(
        "Password must be at least 8 characters and include one number, one special character, and one uppercase letter."
      )
    ).toBeInTheDocument();
  });

  it("sets proper autocomplete attributes for password fields", () => {
    render(<ConfirmResetForm {...mockProps} />);

    const passwordInput = screen.getByLabelText(/NEW PASSWORD/i);
    const confirmPasswordInput = screen.getByLabelText(/CONFIRM PASSWORD/i);

    expect(passwordInput).toHaveAttribute("autocomplete", "new-password");
    expect(confirmPasswordInput).toHaveAttribute(
      "autocomplete",
      "new-password"
    );
  });

  it("properly handles placeholders for email input", () => {
    render(<ConfirmResetForm {...mockProps} />);

    const emailInput = screen.getByLabelText(/EMAIL/i);
    expect(emailInput).toHaveAttribute("placeholder", "user@example.com");
  });
});
