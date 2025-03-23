import React from "react";
import {
  render,
  screen,
  fireEvent,
  waitFor,
  act,
} from "@testing-library/react";
import SignupPage from "@/app/signup/page";
import { useAuth } from "@/app/contexts/AuthContext";
import * as useFormModule from "@/app/hooks/useForm";
import { validateAuthForm } from "@/app/utils/validation/formValidation";
import { processApiError } from "@/app/utils/errors/errorService";
import { ERROR_TYPES } from "@/app/utils/errors/errorTypes";

jest.mock("next/navigation", () => ({
  useRouter: jest.fn(() => ({
    push: jest.fn(),
  })),
}));

jest.mock("@/app/contexts/AuthContext", () => ({
  useAuth: jest.fn(),
}));

jest.mock("@/app/utils/validation/formValidation", () => ({
  validateAuthForm: jest.fn().mockReturnValue({}),
}));

jest.mock("@/app/utils/errors/errorService", () => ({
  processApiError: jest.fn((err) => ({
    type: "processed_error",
    message: err.message || "Error message",
  })),
}));

jest.mock("@/app/hooks/useForm", () => {
  const originalModule = jest.requireActual("@/app/hooks/useForm");
  return {
    ...originalModule,
    useForm: jest.fn(),
  };
});

jest.mock("@/app/components/ui/console", () => ({
  ConsoleWindow: ({ children, title, statusItems }) => (
    <div data-testid="console-window" data-title={title}>
      {children}
      <div data-testid="status-bar">
        {statusItems.map((item, index) => (
          <span key={index} data-testid="status-item">
            {typeof item === "string" ? item : item.text}
          </span>
        ))}
      </div>
    </div>
  ),
  ConsoleSection: ({ children, command }) => (
    <div data-testid="console-section" data-command={command}>
      {children}
    </div>
  ),
  CommandOutput: ({ children, title }) => (
    <div data-testid="command-output" data-title={title}>
      {children}
    </div>
  ),
}));

jest.mock("@/app/components/forms", () => ({
  SignupForm: jest.fn(
    ({
      formData,
      formErrors,
      handleChange,
      handleSubmit,
      isSubmitting,
      apiError,
      passwordRequirements,
    }) => (
      <div data-testid="signup-form">
        <div data-testid="form-data">{JSON.stringify(formData)}</div>
        <div data-testid="form-errors">{JSON.stringify(formErrors)}</div>
        <div data-testid="is-submitting">{isSubmitting.toString()}</div>
        <div data-testid="api-error">{JSON.stringify(apiError)}</div>
        <div data-testid="password-requirements">
          {JSON.stringify(passwordRequirements)}
        </div>
        <input
          data-testid="email-input"
          name="email"
          value={formData.email}
          onChange={handleChange}
          placeholder="Email"
        />
        <input
          data-testid="password-input"
          name="password"
          type="password"
          value={formData.password}
          onChange={handleChange}
          placeholder="Password"
        />
        <input
          data-testid="confirm-password-input"
          name="confirmPassword"
          type="password"
          value={formData.confirmPassword}
          onChange={handleChange}
          placeholder="Confirm password"
        />
        <button data-testid="submit-button" onClick={handleSubmit}>
          Create Account
        </button>
      </div>
    )
  ),
}));

const originalConsoleError = console.error;
const mockConsoleError = jest.fn();

describe("SignupPage", () => {
  const mockFormData = {
    email: "",
    password: "",
    confirmPassword: "",
  };
  const mockFormErrors = {};
  const mockIsSubmitting = false;
  const mockHandleChange = jest.fn();
  const mockHandleSubmit = jest.fn();
  const mockSignUp = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();

    console.error = mockConsoleError;

    useAuth.mockReturnValue({
      isLoading: false,
      signUp: mockSignUp,
    });

    useFormModule.useForm.mockReturnValue({
      formData: mockFormData,
      formErrors: mockFormErrors,
      isSubmitting: mockIsSubmitting,
      handleChange: mockHandleChange,
      handleSubmit: mockHandleSubmit,
    });
  });

  afterEach(() => {
    console.error = originalConsoleError;
  });

  it("renders signup interface correctly", () => {
    render(<SignupPage />);

    expect(screen.getByTestId("console-window")).toBeInTheDocument();
    expect(screen.getByTestId("console-window")).toHaveAttribute(
      "data-title",
      "tech-incidents-registration"
    );
    expect(screen.getByTestId("console-section")).toBeInTheDocument();
    expect(screen.getByTestId("console-section")).toHaveAttribute(
      "data-command",
      "security --register"
    );
    expect(screen.getByTestId("command-output")).toBeInTheDocument();
    expect(screen.getByTestId("command-output")).toHaveAttribute(
      "data-title",
      "JOIN THE ARCHIVE"
    );
    expect(screen.getByTestId("signup-form")).toBeInTheDocument();

    expect(
      screen.getByText(
        "Create a new account to become a member of the Archive and contribute."
      )
    ).toBeInTheDocument();
  });

  it("displays correct status items", () => {
    render(<SignupPage />);

    const statusItems = screen.getAllByTestId("status-item");
    expect(statusItems[0].textContent).toBe("TECH INCIDENTS ARCHIVE");
    expect(statusItems[1].textContent).toBe("USER REGISTRATION");
    expect(statusItems[2].textContent).toBe("NEW ACCOUNT CREATION");
  });

  it("calls handleSubmit and performs validation when form is submitted", async () => {
    const mockCustomHandleSubmit = jest
      .fn()
      .mockImplementation((formData) => {});

    useFormModule.useForm.mockReturnValue({
      formData: {
        email: "test@example.com",
        password: "Password123!",
        confirmPassword: "Password123!",
      },
      formErrors: {},
      isSubmitting: false,
      handleChange: mockHandleChange,
      handleSubmit: mockCustomHandleSubmit,
    });

    render(<SignupPage />);

    const submitButton = screen.getByTestId("submit-button");
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockCustomHandleSubmit).toHaveBeenCalled();
    });
  });

  it("submission fails if passwords don't meet requirements", async () => {
    const formSubmitRef = React.createRef();
    let capturedHandleFormSubmit;

    useFormModule.useForm.mockImplementation(
      (initialValues, validationFn, onSubmit) => {
        capturedHandleFormSubmit = onSubmit;
        return {
          formData: {
            email: "test@example.com",
            password: "weak",
            confirmPassword: "weak",
          },
          formErrors: {},
          isSubmitting: false,
          handleChange: mockHandleChange,
          handleSubmit: jest.fn().mockImplementation(() => {
            capturedHandleFormSubmit({
              email: "test@example.com",
              password: "weak",
              confirmPassword: "weak",
            });
          }),
        };
      }
    );

    render(<SignupPage />);

    const submitButton = screen.getByTestId("submit-button");
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockSignUp).toHaveBeenCalled();
    });
    await waitFor(() => {
      const apiErrorElement = screen.getByTestId("api-error");
      const apiError = JSON.parse(apiErrorElement.textContent);
      expect(apiError).not.toBeNull();
      expect(apiError.type).toBe(ERROR_TYPES.BAD_REQUEST);
    });
  });

  it("handles successful sign up", async () => {
    mockSignUp.mockResolvedValue({ id: "user123" });

    let capturedHandleFormSubmit;
    useFormModule.useForm.mockImplementation(
      (initialValues, validationFn, onSubmit) => {
        capturedHandleFormSubmit = onSubmit;
        return {
          formData: {
            email: "test@example.com",
            password: "Password123!",
            confirmPassword: "Password123!",
          },
          formErrors: {},
          isSubmitting: false,
          handleChange: mockHandleChange,
          handleSubmit: jest.fn().mockImplementation(() => {
            capturedHandleFormSubmit({
              email: "test@example.com",
              password: "Password123!",
              confirmPassword: "Password123!",
            });
          }),
        };
      }
    );

    render(<SignupPage />);

    const submitButton = screen.getByTestId("submit-button");
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockSignUp).toHaveBeenCalledWith({
        email: "test@example.com",
        password: "Password123!",
        displayName: "test",
      });
    });

    await waitFor(() => {
      const apiErrorElement = screen.getByTestId("api-error");
      const apiError = JSON.parse(apiErrorElement.textContent);
      expect(apiError).not.toBeNull();
      expect(apiError.type).toBe("success");
      expect(apiError.message).toContain("Account created successfully");
    });
  });

  it("handles sign up error", async () => {
    const signupError = new Error("Email already in use");
    mockSignUp.mockRejectedValue(signupError);

    processApiError.mockReturnValue({
      type: "already_exists",
      message: "Email already in use",
    });

    let capturedHandleFormSubmit;
    useFormModule.useForm.mockImplementation(
      (initialValues, validationFn, onSubmit) => {
        capturedHandleFormSubmit = onSubmit;
        return {
          formData: {
            email: "test@example.com",
            password: "Password123!",
            confirmPassword: "Password123!",
          },
          formErrors: {},
          isSubmitting: false,
          handleChange: mockHandleChange,
          handleSubmit: jest.fn().mockImplementation(() => {
            capturedHandleFormSubmit({
              email: "test@example.com",
              password: "Password123!",
              confirmPassword: "Password123!",
            });
          }),
        };
      }
    );

    render(<SignupPage />);

    const submitButton = screen.getByTestId("submit-button");
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockSignUp).toHaveBeenCalled();
    });

    await waitFor(() => {
      expect(processApiError).toHaveBeenCalledWith(
        signupError,
        expect.objectContaining({
          defaultMessage: "Failed to create account",
        })
      );
    });

    await waitFor(() => {
      const apiErrorElement = screen.getByTestId("api-error");
      const apiError = JSON.parse(apiErrorElement.textContent);
      expect(apiError).not.toBeNull();
      expect(apiError.type).toBe("already_exists");
      expect(apiError.message).toBe("Email already in use");
    });
  });

  it("uses email prefix as display name during signup", async () => {
    mockSignUp.mockResolvedValue({ id: "user123" });

    let capturedHandleFormSubmit;
    useFormModule.useForm.mockImplementation(
      (initialValues, validationFn, onSubmit) => {
        capturedHandleFormSubmit = onSubmit;
        return {
          formData: {
            email: "john.doe@example.com",
            password: "Password123!",
            confirmPassword: "Password123!",
          },
          formErrors: {},
          isSubmitting: false,
          handleChange: mockHandleChange,
          handleSubmit: jest.fn().mockImplementation(() => {
            capturedHandleFormSubmit({
              email: "john.doe@example.com",
              password: "Password123!",
              confirmPassword: "Password123!",
            });
          }),
        };
      }
    );

    render(<SignupPage />);

    const submitButton = screen.getByTestId("submit-button");
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockSignUp).toHaveBeenCalledWith({
        email: "john.doe@example.com",
        password: "Password123!",
        displayName: "john.doe",
      });
    });
  });

  it("validates form using validateAuthForm with correct options", () => {
    render(<SignupPage />);

    const useFormCalls = useFormModule.useForm.mock.calls;
    expect(useFormCalls.length).toBeGreaterThan(0);

    const validationFunction = useFormCalls[0][1];

    const testData = {
      email: "test@example.com",
      password: "pass",
      confirmPassword: "pass2",
    };
    validationFunction(testData);

    expect(validateAuthForm).toHaveBeenCalledWith(testData, undefined, {
      options: {
        requirePasswordConfirmation: true,
        minLength: 8,
        requireUppercase: true,
        requireNumbers: true,
        requireSpecial: true,
      },
    });
  });

  it("passes correct props to SignupForm component", () => {
    const testFormData = {
      email: "test@example.com",
      password: "password123",
      confirmPassword: "password123",
    };

    const testFormErrors = {
      email: "Invalid email",
    };

    useFormModule.useForm.mockReturnValue({
      formData: testFormData,
      formErrors: testFormErrors,
      isSubmitting: true,
      handleChange: mockHandleChange,
      handleSubmit: mockHandleSubmit,
    });

    const { rerender } = render(<SignupPage />);

    act(() => {
      const component = screen.getByTestId("signup-form");

      const SignupFormMock = require("@/app/components/forms").SignupForm;
      const { calls } = SignupFormMock.mock;
      const lastCall = calls[calls.length - 1];

      expect(lastCall[0].formData).toBe(testFormData);
      expect(lastCall[0].formErrors).toBe(testFormErrors);
      expect(lastCall[0].handleChange).not.toBe(mockHandleChange);
      expect(lastCall[0].handleSubmit).toBe(mockHandleSubmit);
      expect(lastCall[0].isSubmitting).toBe(true);
    });
  });

  it("prevents duplicate submissions", async () => {
    const mockSignUpTracker = jest.fn();
    mockSignUp.mockImplementation(async (data) => {
      mockSignUpTracker(data);

      await new Promise((resolve) => setTimeout(resolve, 50));
      return { id: "user123" };
    });

    let capturedHandleFormSubmit;
    useFormModule.useForm.mockImplementation(
      (initialValues, validationFn, onSubmit) => {
        capturedHandleFormSubmit = onSubmit;
        return {
          formData: {
            email: "test@example.com",
            password: "Password123!",
            confirmPassword: "Password123!",
          },
          formErrors: {},
          isSubmitting: false,
          handleChange: mockHandleChange,
          handleSubmit: jest.fn().mockImplementation(() => {
            capturedHandleFormSubmit({
              email: "test@example.com",
              password: "Password123!",
              confirmPassword: "Password123!",
            });

            capturedHandleFormSubmit({
              email: "test@example.com",
              password: "Password123!",
              confirmPassword: "Password123!",
            });
          }),
        };
      }
    );

    render(<SignupPage />);

    const submitButton = screen.getByTestId("submit-button");
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockSignUpTracker).toHaveBeenCalledTimes(1);
    });
  });
});
