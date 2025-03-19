/**
 * Form validation utility functions
 */
import { formatDateForDisplay, parseDate } from "./formatting/dateUtils";

/**
 * Validates a date string in DD-MM-YYYY format
 * @param {string} dateString - Date string in DD-MM-YYYY format
 * @param {object} options - Validation options
 * @param {Date} options.minDate - Minimum allowed date
 * @param {Date} options.maxDate - Maximum allowed date
 * @returns {object} - Validation result {isValid, errorMessage}
 */
export const validateDateString = (dateString, options = {}) => {
  const { minDate = new Date(1980, 0, 1), maxDate = new Date(2029, 11, 31) } =
    options;

  // Required check
  if (!dateString?.trim()) {
    return {
      isValid: false,
      errorMessage: "Date is required.",
    };
  }

  // Format check
  const dateRegex = /^(\d{2})-(\d{2})-(\d{4})$/;
  if (!dateRegex.test(dateString)) {
    return {
      isValid: false,
      errorMessage: "Please enter a valid date in DD-MM-YYYY format.",
    };
  }

  // Use parseDate to validate and create date object
  const inputDate = parseDate(dateString);

  if (!inputDate) {
    return {
      isValid: false,
      errorMessage: "This date doesn't exist in the calendar.",
    };
  }

  // Range check
  if (inputDate < minDate) {
    return {
      isValid: false,
      errorMessage: `Date must be on or after ${formatDateForDisplay(minDate)}.`,
    };
  }

  if (inputDate > maxDate) {
    return {
      isValid: false,
      errorMessage: `Date must be on or before ${formatDateForDisplay(maxDate)}.`,
    };
  }

  return { isValid: true, errorMessage: "" };
};

/**
 * Validates that a field has a minimum length
 * @param {string} value - Field value
 * @param {number} minLength - Minimum required length
 * @param {string} fieldName - Name of the field for error message
 * @returns {object} - Validation result {isValid, errorMessage}
 */
export const validateMinLength = (value, minLength, fieldName) => {
  if (!value?.trim()) {
    return {
      isValid: false,
      errorMessage: `${fieldName} is required.`,
    };
  }

  if (value.trim().length < minLength) {
    return {
      isValid: false,
      errorMessage: `${fieldName} must be at least ${minLength} characters.`,
    };
  }

  return { isValid: true, errorMessage: "" };
};

/**
 * Validates file attributes for image uploads
 * @param {File} file - The file object
 * @param {object} options - Validation options
 * @param {number} options.maxSizeInMB - Maximum file size in MB
 * @param {number} options.maxWidth - Maximum image width in pixels
 * @param {number} options.maxHeight - Maximum image height in pixels
 * @returns {Promise<object>} - Validation result {isValid, errorMessage}
 */
export const validateImageFile = (file, options = {}) => {
  const { maxSizeInMB = 2, maxWidth = 863, maxHeight = 768 } = options;

  if (!file) {
    return { isValid: false, errorMessage: "An image file is required." };
  }

  if (!file.type.startsWith("image/")) {
    return { isValid: false, errorMessage: "Selected file is not an image." };
  }

  const maxSizeInBytes = maxSizeInMB * 1024 * 1024;
  if (file.size > maxSizeInBytes) {
    return {
      isValid: false,
      errorMessage: `Image size must be less than ${maxSizeInMB}MB.`,
    };
  }

  // Return a Promise only for dimension checks
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = function () {
        if (this.width > maxWidth || this.height > maxHeight) {
          resolve({
            isValid: false,
            errorMessage: `Image dimensions should not exceed ${maxWidth}x${maxHeight} pixels.`,
          });
        } else {
          resolve({ isValid: true, errorMessage: "" });
        }
      };
      img.onerror = () => {
        resolve({
          isValid: false,
          errorMessage: "Error loading image. File may be corrupted.",
        });
      };
      img.src = event.target.result;
    };

    reader.onerror = () => {
      resolve({
        isValid: false,
        errorMessage: "Error reading file. Please try again.",
      });
    };

    reader.readAsDataURL(file);
  });
};

/**
 * Validates an email address
 * @param {string} email - Email address to validate
 * @returns {object} - Validation result {isValid, errorMessage}
 */
export const validateEmail = (email) => {
  if (!email?.trim()) {
    return {
      isValid: false,
      errorMessage: "Email is required.",
    };
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return {
      isValid: false,
      errorMessage: "Please enter a valid email address.",
    };
  }

  return { isValid: true, errorMessage: "" };
};

/**
 * Validates a password
 * @param {string} password - Password to validate
 * @param {object} data - Form data for validating password field against confirm password field if present
 * @param {object} options - Validation options
 * @param {number} options.minLength - Minimum password length
 * @param {boolean} options.requireUppercase - Whether to require uppercase letters
 * @param {boolean} options.requireNumbers - Whether to require numbers
 * @param {boolean} options.requireSpecial - Whether to require special characters
 * @param {boolean} options.requirePasswordConfirmation - Whether to require a matching confirm password field
 * @returns {object} - Validation result {isValid, errorMessage}
 */
export const validatePassword = (password, data = {}, options = {}) => {
  const {
    minLength = 8,
    requireUppercase = true,
    requireNumbers = true,
    requireSpecial = false,
    requirePasswordConfirmation = false,
  } = options;

  if (!password) {
    return {
      isValid: false,
      errorMessage: "Password is required.",
    };
  }

  if (password.length < minLength) {
    return {
      isValid: false,
      errorMessage: `Password must be at least ${minLength} characters.`,
    };
  }

  if (requireUppercase && !/[A-Z]/.test(password)) {
    return {
      isValid: false,
      errorMessage: "Password must include at least one uppercase letter.",
    };
  }

  if (requireNumbers && !/\d/.test(password)) {
    return {
      isValid: false,
      errorMessage: "Password must include at least one number.",
    };
  }

  if (requireSpecial && !/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    return {
      isValid: false,
      errorMessage: "Password must include at least one special character.",
    };
  }

  if (requirePasswordConfirmation) {
    if (data.confirmPassword && password !== data.confirmPassword) {
      return {
        isValid: false,
        errorMessage: "Passwords do not match.",
      };
    }
  }

  return { isValid: true, errorMessage: "" };
};

/**
 * Validates HTML artifact content
 * @param {string} content - HTML content to validate
 * @param {boolean} requireHtmlTag - Whether to require <html> tag
 * @returns {object} - Validation result {isValid, errorMessage}
 */
export const validateHtmlContent = (content, requireHtmlTag = true) => {
  if (!content?.trim()) {
    return {
      isValid: false,
      errorMessage: "HTML Code is required when Artifact Type is set to Code.",
    };
  }

  if (requireHtmlTag && !content.includes("<html>")) {
    return {
      isValid: false,
      errorMessage: "HTML code should include a <html> tag.",
    };
  }

  return { isValid: true, errorMessage: "" };
};

/**
 * Creates a form validation function based on a schema
 * @param {Object} schema - Validation schema with field rules
 * @returns {Function} - Validation function that validates against the schema
 */
export const createFormValidator = (schema) => {
  return (data, fieldName = null) => {
    const errors = {};

    // Validate just a single field if specified
    if (fieldName) {
      const fieldSchema = schema[fieldName];
      if (!fieldSchema) return errors;

      const fieldValidation = validateField(data, fieldName, fieldSchema);
      if (fieldValidation.errorMessage) {
        errors[fieldName] = fieldValidation.errorMessage;
      }

      return errors;
    }

    // Validate all fields in the schema
    Object.entries(schema).forEach(([field, fieldSchema]) => {
      if (fieldSchema.conditional && !fieldSchema.conditional(data)) {
        return;
      }

      const fieldValidation = validateField(data, field, fieldSchema);
      if (fieldValidation.errorMessage) {
        errors[field] = fieldValidation.errorMessage;
      }
    });

    return errors;
  };
};

/**
 * Validates a field against its schema
 * @param {Object} data - Form data
 * @param {string} fieldName - Name of the field
 * @param {Object} fieldSchema - Schema for the field
 * @returns {Object} - Validation result
 */
const validateField = (data, fieldName, fieldSchema) => {
  const value = data[fieldName];

  switch (fieldSchema.type) {
    case "text":
    case "string":
      if (fieldSchema.required || fieldSchema.minLength) {
        return validateMinLength(
          value,
          fieldSchema.minLength || 1,
          fieldSchema.label || fieldName
        );
      }
      break;

    case "date":
      return validateDateString(value, fieldSchema.options);

    case "email":
      return validateEmail(value);

    case "password":
      return validatePassword(value, fieldSchema.options);

    case "confirmPassword":
      return validatePassword(value, data, fieldSchema.options);

    case "html":
      if (fieldSchema.required) {
        return validateHtmlContent(value, fieldSchema.requireHtmlTag);
      }
      break;

    case "image":
      if (fieldSchema.required && !data.fileState?.data) {
        return {
          isValid: false,
          errorMessage:
            fieldSchema.errorMessage || "An image file is required.",
        };
      }
      break;

    case "custom":
      if (fieldSchema.validate) {
        return fieldSchema.validate(value, data);
      }
      break;
  }

  return { isValid: true, errorMessage: "" };
};

/**
 * Incident form schema for both Add and Edit forms
 */
export const incidentFormSchema = {
  name: {
    type: "text",
    minLength: 3,
    label: "Incident Name",
    required: true,
  },
  incident_date: {
    type: "date",
    required: true,
    options: {
      minDate: new Date(1980, 0, 1),
      maxDate: new Date(2029, 11, 31),
    },
  },
  description: {
    type: "text",
    minLength: 10,
    label: "Description",
    required: true,
  },
  artifactContent: {
    type: "html",
    required: true,
    requireHtmlTag: true,
    conditional: (data) => data.artifactType === "code",
    errorMessage:
      "HTML code is required when Artifact Type is set to Code. Remember to add a <html> tag.",
  },
  file: {
    type: "image",
    required: true,
    conditional: (data) => data.artifactType === "image",
    errorMessage:
      "An image file is required when Artifact Type is set to Image.",
  },
};

export const AuthFormSchema = {
  email: {
    type: "email",
    required: true,
  },
  password: {
    type: "password",
    required: true,
  },
  confirmPassword: {
    type: "confirmPassword",
    required: false,
  },
};

// Pre-built validator for incident forms
export const validateIncidentForm = createFormValidator(incidentFormSchema);
export const validateAuthForm = createFormValidator(AuthFormSchema);
