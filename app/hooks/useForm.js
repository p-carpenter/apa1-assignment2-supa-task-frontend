import { useState, useCallback, useRef, useEffect } from "react";
import { processValidationError } from "../utils/errors/errorService";

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
  const [touched, setTouched] = useState({});
  const isMounted = useRef(true);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      isMounted.current = false;
    };
  }, []);

  /**
   * Sets a field value directly
   *
   * @param {string} name - Field name
   * @param {any} value - Field value
   */
  const setFieldValue = useCallback(
    (name, value) => {
      setFormData((prevData) => ({
        ...prevData,
        [name]: value,
      }));

      // Run field-level validation if a validate function exists
      if (validateFn) {
        const newData = { ...formData, [name]: value };
        try {
          const fieldError = validateFn(newData, name);
          if (fieldError && typeof fieldError === "object") {
            setFormErrors((prevErrors) => ({
              ...prevErrors,
              [name]: fieldError[name],
            }));
          }
        } catch (error) {
          // Ignore validation errors during field change
        }
      }
    },
    [formData, validateFn]
  );

  /**
   * Handle form input changes
   * @param {Event} e - Change event
   */
  const handleChange = useCallback(
    (e) => {
      const { name, value, type, checked } = e.target;
      const inputValue = type === "checkbox" ? checked : value;

      setFormData((prevData) => ({
        ...prevData,
        [name]: inputValue,
      }));

      // Run field-level validation if a validate function exists
      if (validateFn) {
        try {
          const fieldError = validateFn(
            { ...formData, [name]: inputValue },
            name
          );

          if (fieldError && typeof fieldError === "object") {
            setFormErrors((prevErrors) => ({
              ...prevErrors,
              [name]: fieldError[name],
            }));
          }
        } catch (error) {
          // Ignore validation errors during input change
        }
      }
    },
    [formData, validateFn]
  );

  /**
   * Handle input blur events
   * @param {Event} e - Blur event
   */
  const handleBlur = useCallback(
    (e) => {
      const { name } = e.target;
      setTouched((prev) => ({ ...prev, [name]: true }));

      // Run field-level validation on blur
      if (validateFn) {
        try {
          const fieldError = validateFn(formData, name);
          if (fieldError && typeof fieldError === "object") {
            setFormErrors((prevErrors) => ({
              ...prevErrors,
              [name]: fieldError[name],
            }));
          }
        } catch (error) {
          // Ignore validation errors during blur
        }
      }
    },
    [formData, validateFn]
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
    async (e) => {
      if (e && e.preventDefault) {
        e.preventDefault();
      }

      setIsSubmitting(true);

      try {
        // Run form validation
        if (validateFn) {
          let errors;
          try {
            errors = validateFn(formData);
          } catch (validationError) {
            throw new Error("Form validation failed. Please check your input.");
          }

          // If there are validation errors, stop submission
          if (errors && Object.keys(errors).length > 0) {
            setFormErrors(errors);

            // Mark all fields as touched
            const allTouched = Object.keys(formData).reduce((acc, key) => {
              acc[key] = true;
              return acc;
            }, {});
            setTouched(allTouched);

            setIsSubmitting(false);
            return;
          }
        }

        // If validation passes, call the submit handler
        if (onSubmit) {
          const result = await Promise.resolve(onSubmit(formData));
          return result;
        }
      } catch (error) {
        // Let the component handle API errors
        throw error;
      } finally {
        // Only update state if component is still mounted
        if (isMounted.current) {
          setIsSubmitting(false);
        }
      }
    },
    [formData, onSubmit, validateFn]
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
