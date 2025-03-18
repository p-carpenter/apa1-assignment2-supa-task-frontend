import { useState, useCallback } from "react";

/**
 * Custom hook for managing form state and validation
 *
 * @param {Object} initialValues - Initial form field values
 * @param {Function} validateFn - Validation function that returns errors object
 * @param {Function} onSubmit - Submit handler function
 * @returns {Object} Form handling methods and state
 */
export const useForm = (initialValues, validateFn, onSubmit) => {
  const [formData, setFormData] = useState(initialValues);
  const [formErrors, setFormErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [touched, setTouched] = useState({});

  const handleChange = useCallback(
    (e) => {
      const { name, value, type, checked } = e.target;
      const inputValue = type === "checkbox" ? checked : value;

      setFormData((prevData) => ({
        ...prevData,
        [name]: inputValue,
      }));

      if (validateFn) {
        const fieldError = validateFn({ [name]: inputValue }, name);
        setFormErrors((prevErrors) => ({
          ...prevErrors,
          [name]: fieldError[name],
        }));
      }
    },
    [validateFn]
  );

  const handleBlur = useCallback(
    (e) => {
      const { name } = e.target;
      setTouched((prev) => ({ ...prev, [name]: true }));

      if (validateFn) {
        const fieldError = validateFn(formData, name);
        setFormErrors((prevErrors) => ({
          ...prevErrors,
          [name]: fieldError[name],
        }));
      }
    },
    [formData, validateFn]
  );

  const setValues = useCallback((values) => {
    setFormData((prevData) => ({
      ...prevData,
      ...values,
    }));
  }, []);

  const setErrors = useCallback((errors) => {
    setFormErrors(errors);
  }, []);

  const resetForm = useCallback(() => {
    setFormData(initialValues);
    setFormErrors({});
    setIsSubmitting(false);
    setSubmitError("");
    setTouched({});
  }, [initialValues]);

  const handleSubmit = useCallback(
    async (e) => {
      e.preventDefault();
      setIsSubmitting(true);
      setSubmitError("");

      try {
        if (validateFn) {
          const errors = validateFn(formData);

          if (Object.keys(errors).length > 0) {
            setFormErrors(errors);

            const allTouched = Object.keys(formData).reduce((acc, key) => {
              acc[key] = true;
              return acc;
            }, {});
            setTouched(allTouched);
            setIsSubmitting(false);
            return;
          }
        }

        if (onSubmit) {
          await onSubmit(formData);
        }
      } catch (error) {
        setSubmitError(error.message || "An error occurred. Please try again.");
        console.error("Form submission error:", error);
      } finally {
        setIsSubmitting(false);
      }
    },
    [formData, onSubmit, validateFn]
  );

  const hasError = useCallback(
    (fieldName) => {
      return Boolean(formErrors[fieldName] && touched[fieldName]);
    },
    [formErrors, touched]
  );

  return {
    formData,
    formErrors,
    isSubmitting,
    submitError,
    touched,
    handleChange,
    handleBlur,
    handleSubmit,
    setValues,
    setErrors,
    resetForm,
    hasError,
  };
};

export default useForm;
