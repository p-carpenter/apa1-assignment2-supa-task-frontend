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

  const setFieldValue = useCallback(
    (name, value) => {
      setFormData((prevData) => ({ ...prevData, [name]: value }));

      if (validateFn) {
        const newData = { ...formData, [name]: value };

        try {
          const fieldErrors = validateFn(newData, name) || {};

          // Update errors to add new ones and remove fixed ones
          setFormErrors((prevErrors) => {
            const newErrors = { ...prevErrors };

            delete newErrors[name];


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

      if (validateFn) {
        try {
          const fieldErrors =
            validateFn({ ...formData, [name]: inputValue }, name) || {};

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

      if (validateFn) {
        try {
          const fieldErrors = validateFn(formData, name) || {};

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
        if (validateFn) {
          let errors = {};

          try {
            errors = validateFn(formData) || {};
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
          const result = await Promise.resolve(onSubmit(formData));
          return result;
        }
      } catch (error) {
        throw error;
      } finally {
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
