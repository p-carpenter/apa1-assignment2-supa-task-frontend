import { renderHook, act } from "@testing-library/react";
import { useForm } from "@/app/hooks/useForm";

// Create standardised event mocks to ensure consistent test behavior
const createChangeEvent = (fieldName, fieldValue, inputType = "text") => ({
  target: {
    name: fieldName,
    value: fieldValue,
    type: inputType,
    checked: inputType === "checkbox" ? fieldValue : undefined,
  },
});

const createBlurEvent = (fieldName) => ({
  target: { name: fieldName },
});

describe("useForm hook", () => {
  // Initial setup for tests
  const initialValues = {
    name: "",
    email: "",
    terms: false,
  };

  const mockValidateFn = jest.fn().mockImplementation((data, fieldName) => {
    const errors = {};

    // Validate specific field if provided
    if (fieldName) {
      if (fieldName === "name" && (!data.name || data.name.length < 3)) {
        errors[fieldName] = "Name must be at least 3 characters long";
      }
      if (fieldName === "email" && (!data.email || !data.email.includes("@"))) {
        errors[fieldName] = "Please enter a valid email";
      }
      if (fieldName === "terms" && !data.terms) {
        errors[fieldName] = "You must accept the terms";
      }
      return errors;
    }

    // Validate all fields
    if (!data.name || data.name.length < 3) {
      errors.name = "Name must be at least 3 characters long";
    }
    if (!data.email || !data.email.includes("@")) {
      errors.email = "Please enter a valid email";
    }
    if (!data.terms) {
      errors.terms = "You must accept the terms";
    }

    return errors;
  });

  const mockSubmit = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should initialize with correct initial values", () => {
    const { result } = renderHook(() =>
      useForm(initialValues, mockValidateFn, mockSubmit)
    );

    expect(result.current.formData).toEqual(initialValues);
    expect(result.current.formErrors).toEqual({});
    expect(result.current.isSubmitting).toBe(false);
    expect(result.current.touched).toEqual({});
  });

  it("should handle input changes correctly", () => {
    const { result } = renderHook(() =>
      useForm(initialValues, mockValidateFn, mockSubmit)
    );

    act(() => {
      result.current.handleChange(createChangeEvent("name", "John Doe"));
    });

    expect(result.current.formData.name).toBe("John Doe");
    expect(mockValidateFn).toHaveBeenCalled();
  });

  it("should handle checkbox input correctly", () => {
    const { result } = renderHook(() =>
      useForm(initialValues, mockValidateFn, mockSubmit)
    );

    act(() => {
      result.current.handleChange(createChangeEvent("terms", true, "checkbox"));
    });

    expect(result.current.formData.terms).toBe(true);
  });

  it("should track touched fields on blur", () => {
    const { result } = renderHook(() =>
      useForm(initialValues, mockValidateFn, mockSubmit)
    );

    act(() => {
      result.current.handleBlur(createBlurEvent("name"));
    });

    expect(result.current.touched.name).toBe(true);
  });

  it("should validate fields on blur", () => {
    const { result } = renderHook(() =>
      useForm(initialValues, mockValidateFn, mockSubmit)
    );

    act(() => {
      result.current.handleBlur(createBlurEvent("name"));
    });

    expect(mockValidateFn).toHaveBeenCalled();
    expect(result.current.formErrors.name).toBe(
      "Name must be at least 3 characters long"
    );
  });

  it("should set field value and validate", () => {
    const { result } = renderHook(() =>
      useForm(initialValues, mockValidateFn, mockSubmit)
    );

    act(() => {
      result.current.setFieldValue("name", "John Doe");
    });

    expect(result.current.formData.name).toBe("John Doe");
    expect(mockValidateFn).toHaveBeenCalled();
  });

  it("should set multiple values at once", () => {
    const { result } = renderHook(() =>
      useForm(initialValues, mockValidateFn, mockSubmit)
    );

    act(() => {
      result.current.setValues({
        name: "John Doe",
        email: "john@example.com",
      });
    });

    expect(result.current.formData.name).toBe("John Doe");
    expect(result.current.formData.email).toBe("john@example.com");
  });

  it("should reset form to initial values", () => {
    const { result } = renderHook(() =>
      useForm(initialValues, mockValidateFn, mockSubmit)
    );

    // Change some values first
    act(() => {
      result.current.setValues({
        name: "John Doe",
        email: "john@example.com",
        terms: true,
      });
      result.current.handleBlur(createBlurEvent("name"));
    });

    // Then reset
    act(() => {
      result.current.resetForm();
    });

    expect(result.current.formData).toEqual(initialValues);
    expect(result.current.formErrors).toEqual({});
    expect(result.current.touched).toEqual({});
    expect(result.current.isSubmitting).toBe(false);
  });

  it("should not submit if validation fails", async () => {
    const { result } = renderHook(() =>
      useForm(initialValues, mockValidateFn, mockSubmit)
    );

    await act(async () => {
      await result.current.handleSubmit({ preventDefault: jest.fn() });
    });

    expect(mockSubmit).not.toHaveBeenCalled();
    expect(result.current.formErrors).toHaveProperty("name");
    expect(result.current.formErrors).toHaveProperty("email");
    expect(result.current.formErrors).toHaveProperty("terms");
    expect(result.current.isSubmitting).toBe(false);
    expect(Object.keys(result.current.touched).length).toBe(3); // All fields should be touched
  });

  it("should submit if validation passes", async () => {
    const validValues = {
      name: "John Doe",
      email: "john@example.com",
      terms: true,
    };

    // Mock validation to pass this time
    mockValidateFn.mockImplementationOnce(() => ({}));

    const { result } = renderHook(() =>
      useForm(validValues, mockValidateFn, mockSubmit)
    );

    await act(async () => {
      await result.current.handleSubmit({ preventDefault: jest.fn() });
    });

    expect(mockSubmit).toHaveBeenCalledWith(validValues);
    expect(result.current.isSubmitting).toBe(false);
  });

  it("should handle validation errors gracefully", async () => {
    // Make validation throw an error
    mockValidateFn.mockImplementationOnce(() => {
      throw new Error("Validation error");
    });

    const { result } = renderHook(() =>
      useForm(initialValues, mockValidateFn, mockSubmit)
    );

    await act(async () => {
      await result.current.handleSubmit({ preventDefault: jest.fn() });
    });

    expect(mockSubmit).not.toHaveBeenCalled();
    expect(result.current.formErrors).toHaveProperty("_form");
    expect(result.current.isSubmitting).toBe(false);
  });

  it("should correctly check if a field has an error", () => {
    const { result } = renderHook(() =>
      useForm(initialValues, mockValidateFn, mockSubmit)
    );

    // Set an error but don't touch the field
    act(() => {
      result.current.setErrors({ name: "Invalid name" });
    });

    expect(result.current.hasError("name")).toBe(false);

    // Now touch the field
    act(() => {
      result.current.handleBlur(createBlurEvent("name"));
    });

    expect(result.current.hasError("name")).toBe(true);
  });

  it("should work with fileState option", () => {
    const mockFileState = {
      data: "base64data",
      name: "test.jpg",
      type: "image/jpeg",
      preview: "blob:url",
    };

    const { result } = renderHook(() =>
      useForm(initialValues, mockValidateFn, mockSubmit, {
        fileState: mockFileState,
      })
    );

    act(() => {
      result.current.handleChange(createChangeEvent("name", "Test"));
    });

    // Validation function should have been called with fileState included
    expect(mockValidateFn).toHaveBeenCalledWith(
      expect.objectContaining({
        name: "Test",
        fileState: mockFileState,
      }),
      "name"
    );
  });
});
