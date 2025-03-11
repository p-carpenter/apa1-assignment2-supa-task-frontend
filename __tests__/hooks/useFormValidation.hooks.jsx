// __tests__/hooks/useFormValidation.test.jsx
import { renderHook, act } from "@testing-library/react-hooks";
import useFormValidation from "@/app/hooks/useFormValidation";

describe("useFormValidation", () => {
  const initialFormState = {
    name: "",
    email: "",
    password: "",
  };

  // Example validation rules
  const validationRules = {
    name: {
      required: true,
      minLength: 2,
      message: "Name is required and must be at least 2 characters",
    },
    email: {
      required: true,
      pattern: /^\S+@\S+\.\S+$/,
      message: "Please enter a valid email",
    },
    password: {
      required: true,
      minLength: 8,
      message: "Password must be at least 8 characters",
    },
  };

  it("initializes with correct initial state", () => {
    const { result } = renderHook(() =>
      useFormValidation(initialFormState, validationRules)
    );

    expect(result.current.formData).toEqual(initialFormState);
    expect(result.current.errors).toEqual({});
    expect(result.current.isSubmitting).toBe(false);
  });

  it("updates form data on handleChange", () => {
    const { result } = renderHook(() =>
      useFormValidation(initialFormState, validationRules)
    );

    act(() => {
      result.current.handleChange({
        target: { name: "email", value: "test@example.com" },
      });
    });

    expect(result.current.formData.email).toBe("test@example.com");
  });

  it("validates required fields on handleSubmit", () => {
    const { result } = renderHook(() =>
      useFormValidation(initialFormState, validationRules)
    );

    const mockSubmitFn = jest.fn();

    act(() => {
      result.current.handleSubmit(mockSubmitFn)({ preventDefault: jest.fn() });
    });

    // Should have errors for all required fields
    expect(result.current.errors.name).toBeTruthy();
    expect(result.current.errors.email).toBeTruthy();
    expect(result.current.errors.password).toBeTruthy();

    // Submit function should not be called with errors
    expect(mockSubmitFn).not.toHaveBeenCalled();
  });

  it("validates pattern fields on handleSubmit", () => {
    const { result } = renderHook(() =>
      useFormValidation(initialFormState, validationRules)
    );

    act(() => {
      result.current.handleChange({
        target: { name: "name", value: "John" },
      });

      result.current.handleChange({
        target: { name: "email", value: "invalid-email" },
      });

      result.current.handleChange({
        target: { name: "password", value: "pass" },
      });
    });

    const mockSubmitFn = jest.fn();

    act(() => {
      result.current.handleSubmit(mockSubmitFn)({ preventDefault: jest.fn() });
    });

    // Should have errors for fields with pattern/minLength violations
    expect(result.current.errors.name).toBeFalsy();
    expect(result.current.errors.email).toBeTruthy();
    expect(result.current.errors.password).toBeTruthy();

    // Submit function should not be called with errors
    expect(mockSubmitFn).not.toHaveBeenCalled();
  });

  it("calls submit function when form is valid", () => {
    const { result } = renderHook(() =>
      useFormValidation(initialFormState, validationRules)
    );

    act(() => {
      result.current.handleChange({
        target: { name: "name", value: "John Doe" },
      });

      result.current.handleChange({
        target: { name: "email", value: "john@example.com" },
      });

      result.current.handleChange({
        target: { name: "password", value: "password123" },
      });
    });

    const mockSubmitFn = jest.fn();

    act(() => {
      result.current.handleSubmit(mockSubmitFn)({ preventDefault: jest.fn() });
    });

    // Should have no errors
    expect(result.current.errors).toEqual({});

    // Submit function should be called with form data
    expect(mockSubmitFn).toHaveBeenCalledWith({
      name: "John Doe",
      email: "john@example.com",
      password: "password123",
    });
  });

  it("resets form data on resetForm call", () => {
    const { result } = renderHook(() =>
      useFormValidation(initialFormState, validationRules)
    );

    act(() => {
      result.current.handleChange({
        target: { name: "name", value: "John Doe" },
      });
    });

    expect(result.current.formData.name).toBe("John Doe");

    act(() => {
      result.current.resetForm();
    });

    expect(result.current.formData).toEqual(initialFormState);
  });

  it("handles custom onChange function", () => {
    const { result } = renderHook(() =>
      useFormValidation(initialFormState, validationRules)
    );

    const customEvent = {
      name: "email",
      value: "custom@example.com",
    };

    act(() => {
      result.current.setFieldValue(customEvent.name, customEvent.value);
    });

    expect(result.current.formData.email).toBe("custom@example.com");
  });
});
