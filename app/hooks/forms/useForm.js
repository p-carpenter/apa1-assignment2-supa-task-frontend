import { useState, useCallback, useRef, useEffect } from "react";

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
  const isMounted = useRef(true);
  

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
      try {
        setFormData((prevData) => ({
          ...prevData,
          [name]: value,
        }));

        if (validateFn) {
          const newData = { ...formData, [name]: value };
          const fieldError = validateFn(newData, name);
          if (fieldError && typeof fieldError === 'object') {
            setFormErrors((prevErrors) => ({
              ...prevErrors,
              [name]: fieldError[name],
            }));
          }
        }
      } catch (error) {
        console.error(`Error setting field value for ${name}:`, error);
        // Set a generic error for the field
        setFormErrors((prevErrors) => ({
          ...prevErrors,
          [name]: "Error updating field value",
        }));
      }
    },
    [formData, validateFn]
  );

  const handleChange = useCallback(
    (e) => {
      try {
        const { name, value, type, checked } = e.target;
        const inputValue = type === "checkbox" ? checked : value;

        setFormData((prevData) => ({
          ...prevData,
          [name]: inputValue,
        }));

        if (validateFn) {
          const fieldError = validateFn(
            { ...formData, [name]: inputValue },
            name
          );
          
          if (fieldError && typeof fieldError === 'object') {
            setFormErrors((prevErrors) => ({
              ...prevErrors,
              [name]: fieldError[name],
            }));
          }
        }
      } catch (error) {
        console.error("Error handling input change:", error);
        if (e && e.target && e.target.name) {
          setFormErrors((prevErrors) => ({
            ...prevErrors,
            [e.target.name]: "Error updating field",
          }));
        }
      }
    },
    [formData, validateFn]
  );

  const handleBlur = useCallback(
    (e) => {
      try {
        const { name } = e.target;
        setTouched((prev) => ({ ...prev, [name]: true }));

        if (validateFn) {
          const fieldError = validateFn(formData, name);
          if (fieldError && typeof fieldError === 'object') {
            setFormErrors((prevErrors) => ({
              ...prevErrors,
              [name]: fieldError[name],
            }));
          }
        }
      } catch (error) {
        console.error("Error handling input blur:", error);
        if (e && e.target && e.target.name) {
          setFormErrors((prevErrors) => ({
            ...prevErrors,
            [e.target.name]: "Error validating field",
          }));
        }
      }
    },
    [formData, validateFn]
  );

  const setValues = useCallback((values) => {
    if (!values || typeof values !== 'object') {
      console.error("Invalid form values:", values);
      return;
    }
    
    try {
      setFormData((prevData) => ({
        ...prevData,
        ...values,
      }));
    } catch (error) {
      console.error("Error setting form values:", error);
      setSubmitError("Failed to update form values");
    }
  }, []);

  const setErrors = useCallback((errors) => {
    if (!errors || typeof errors !== 'object') {
      console.error("Invalid form errors:", errors);
      return;
    }
    
    try {
      setFormErrors(errors);
    } catch (error) {
      console.error("Error setting form errors:", error);
    }
  }, []);

  const resetForm = useCallback(() => {
    try {
      setFormData(initialValues);
      setFormErrors({});
      setIsSubmitting(false);
      setSubmitError("");
      setTouched({});
    } catch (error) {
      console.error("Error resetting form:", error);
      setSubmitError("Failed to reset form");
    }
  }, [initialValues]);

  const handleSubmit = useCallback(
    async (e) => {
      if (e && e.preventDefault) {
        e.preventDefault();
      }
      
      setIsSubmitting(true);
      setSubmitError("");

      try {
        // Validate the form data
        if (validateFn) {
          let errors;
          try {
            errors = validateFn(formData);
          } catch (validationError) {
            console.error("Form validation error:", validationError);
            throw new Error("Form validation failed. Please check your input.");
          }

          if (errors && Object.keys(errors).length > 0) {
            setFormErrors(errors);

            const allTouched = Object.keys(formData).reduce((acc, key) => {
              acc[key] = true;
              return acc;
            }, {});
            setTouched(allTouched);
            
            if (isMounted.current) {
              setIsSubmitting(false);
            }
            
            return;
          }
        }


        if (onSubmit) {
          const result = await Promise.resolve(onSubmit(formData));
          
          // If result contains an error property, set it as submit error
          if (result && result.error) {
            throw new Error(result.error);
          }
          
          return result;
        }
      } catch (error) {
        console.error("Form submission error:", error);
        
        if (isMounted.current) {
          setSubmitError(error.message || "An error occurred. Please try again.");
        }
        
        // Re-throw the error for the caller to handle if needed
        throw error;
      } finally {
        if (isMounted.current) {
          setIsSubmitting(false);
        }
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
    setFieldValue,
    setValues,
    setErrors,
    resetForm,
    hasError,
  };
};

export default useForm;
