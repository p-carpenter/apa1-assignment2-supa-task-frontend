import { useState, useCallback, useRef, useEffect } from "react";
/**
 * Custom hook for managing form state and validation
 *
 * @param {Object} initialValues - Initial form field values
 * @param {Function} validateFn - Validation function that returns errors object
 * @param {Function} onSubmit - Submit handler function
 * @param {Object} options - Additional options
 * @param {Object} options.fileState - File state from useFileUpload hook
 * @returns {Object} Form handling methods and state
 */
export const useForm = (initialValues, validateFn, onSubmit, options = {}) => {
  const [formData, setFormData] = useState(initialValues);
  const [formErrors, setFormErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [touched, setTouched] = useState({});
  const isMounted = useRef(true);
  const { fileState } = options;

  useEffect(() => {
    // Prevent state updates after component unmount to avoid memory leaks
    return () => {
      isMounted.current = false;
    };
  }, []);

  const setFieldValue = useCallback(
    (name, value) => {
      setFormData((prevData) => ({ ...prevData, [name]: value }));

      if (validateFn) {
        const newData = { ...formData, [name]: value };

        try {
          const dataWithFileState = fileState
            ? { ...newData, fileState }
            : newData;
          const fieldErrors = validateFn(dataWithFileState, name) || {};

          setFormErrors((previousErrors) => {
            // Create a fresh copy to avoid mutating state directly
            const newErrors = { ...previousErrors };

            // Remove old error before potentially adding new one
            delete newErrors[name];

            // Only add error if validation found an issue
            if (fieldErrors[name]) {
              newErrors[name] = fieldErrors[name];
            }

            return newErrors;
          });
        } catch (error) {
          console.warn("Unexpected validation function error:", error);
        }
      }
    },
    [formData, validateFn, fileState]
  );

  /**
   * Handle form input changes
   * @param {Event} e - Change event
   */
  const handleChange = useCallback(
    (changeEvent) => {
      const { name, value, type, checked } = changeEvent.target;
      const inputValue = type === "checkbox" ? checked : value;

      setFormData((prevData) => ({
        ...prevData,
        [name]: inputValue,
      }));

      if (validateFn) {
        try {
          const newData = { ...formData, [name]: inputValue };
          const dataWithFileState = fileState
            ? { ...newData, fileState }
            : newData;
          const fieldErrors = validateFn(dataWithFileState, name) || {};

          setFormErrors((prevErrors) => {
            const newErrors = { ...prevErrors };

            delete newErrors[name];

            if (fieldErrors[name]) {
              newErrors[name] = fieldErrors[name];
            }

            return newErrors;
          });
        } catch (error) {
          console.warn("Field validation error:", error);
          setFormErrors((prevErrors) => ({
            ...prevErrors,
            [name]: "Validation failed",
          }));
        }
      }
    },
    [formData, validateFn, fileState]
  );

  /**
   * Validates field on blur to provide immediate feedback
   * @param {Event} blurEvent - Blur event from input field
   */
  const handleBlur = useCallback(
    (blurEvent) => {
      const { name } = blurEvent.target;
      setTouched((previousTouched) => ({ ...previousTouched, [name]: true }));

      if (validateFn) {
        try {
          const dataWithFileState = fileState
            ? { ...formData, fileState }
            : formData;
          const fieldErrors = validateFn(dataWithFileState, name) || {};

          if (Object.keys(fieldErrors).length > 0) {
            setFormErrors((prevErrors) => ({
              ...prevErrors,
              ...fieldErrors,
            }));
          }
        } catch (error) {
          console.warn("Field validation error:", error);
          setFormErrors((prevErrors) => ({
            ...prevErrors,
            [name]: "Validation failed",
          }));
        }
      }
    },
    [formData, validateFn, fileState]
  );

  /**
   * Set multiple form values at once
   * @param {Object} values - Values to set
   */
  const setValues = useCallback((values) => {
    if (!values || typeof values !== "object") {
      return;
    }

    setFormData((prevData) => ({
      ...prevData,
      ...values,
    }));
  }, []);

  /**
   * Set form errors directly
   * @param {Object} errors - Error object
   */
  const setErrors = useCallback((errors) => {
    if (!errors || typeof errors !== "object") {
      return;
    }

    setFormErrors(errors);
  }, []);

  /**
   * Reset the form to its initial state
   */
  const resetForm = useCallback(() => {
    setFormData(initialValues);
    setFormErrors({});
    setIsSubmitting(false);
    setTouched({});
  }, [initialValues]);

  /**
   * Handle form submission
   * @param {Event} e - Submit event
   * @returns {Promise} Result of submission
   */
  const handleSubmit = useCallback(
    async (submitEvent) => {
      if (submitEvent && submitEvent.preventDefault) {
        submitEvent.preventDefault();
      }

      let formSubmissionPromise;

      try {
        setIsSubmitting(true);

        if (validateFn) {
          let errors = {};

          try {
            const dataWithFileState = fileState
              ? { ...formData, fileState }
              : formData;
            errors = validateFn(dataWithFileState) || {};
          } catch (validationError) {
            console.warn("Form validation error:", validationError);
            errors = {
              _form: "Form validation failed. Please check your input.",
            };
          }

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
          formSubmissionPromise = Promise.resolve(onSubmit(formData));
          const result = await formSubmissionPromise;
          return result;
        }
      } catch (error) {
        console.warn("Form submission error:", error);
        throw error;
      } finally {
        // Always reset the submitting state in the next event loop
        // This ensures it happens after any state updates from error handling
        setTimeout(() => {
          if (isMounted.current) {
            setIsSubmitting(false);
          }
        }, 0);
      }
    },
    [formData, onSubmit, validateFn, fileState]
  );

  /**
   * Check if a field has an error
   * @param {string} fieldName - Name of the field
   * @returns {boolean} True if field has an error
   */
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
    touched,
    handleChange,
    handleBlur,
    handleSubmit,
    setFieldValue,
    setValues,
    setErrors,
    resetForm,
    hasError,
  };
};

export default useForm;
