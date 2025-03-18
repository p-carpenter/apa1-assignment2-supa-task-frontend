/**
 * Form validation utility functions
 */

/**
 * Validates a date string in DD-MM-YYYY format
 * @param {string} dateString - Date string in DD-MM-YYYY format
 * @param {object} options - Validation options
 * @param {Date} options.minDate - Minimum allowed date
 * @param {Date} options.maxDate - Maximum allowed date
 * @returns {object} - Validation result {isValid, errorMessage}
 */
export const validateDateString = (dateString, options = {}) => {
  const {
    minDate = new Date(1980, 0, 1),
    maxDate = new Date(2029, 11, 31),
  } = options;

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

  // Date validity check
  const match = dateString.match(dateRegex);
  const day = parseInt(match[1], 10);
  const month = parseInt(match[2], 10) - 1;
  const year = parseInt(match[3], 10);
  const inputDate = new Date(year, month, day);

  if (
    inputDate.getFullYear() !== year ||
    inputDate.getMonth() !== month ||
    inputDate.getDate() !== day
  ) {
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
 * Formats a Date object for display in DD-MM-YYYY format
 * @param {Date} date - Date object
 * @returns {string} - Formatted date string
 */
const formatDateForDisplay = (date) => {
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();
  return `${day}-${month}-${year}`;
};

/**
 * Converts a date string from DD-MM-YYYY to YYYY-MM-DD format
 * @param {string} dateString - Date string in DD-MM-YYYY format
 * @returns {string} - Date string in YYYY-MM-DD format
 */
export const convertDateForStorage = (dateString) => {
  if (!dateString) return "";
  const [day, month, year] = dateString.split("-");
  return `${year}-${month}-${day}`;
};

/**
 * Formats a date string for input in the expected DD-MM-YYYY format
 * @param {string} input - Partial or complete date input
 * @returns {string} - Formatted date string with automatic hyphen insertion
 */
export const formatDateInput = (input) => {
  // Allow typing with hyphens automatically added
  let formattedDate = input;
  const digits = input.replace(/\D/g, "");

  if (digits.length <= 2) {
    formattedDate = digits;
  } else if (digits.length <= 4) {
    formattedDate = `${digits.substring(0, 2)}-${digits.substring(2)}`;
  } else if (digits.length <= 8) {
    formattedDate = `${digits.substring(0, 2)}-${digits.substring(2, 4)}-${digits.substring(
      4,
      8
    )}`;
  }

  return formattedDate;
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
  return new Promise((resolve) => {
    const {
      maxSizeInMB = 2,
      maxWidth = 863,
      maxHeight = 768,
    } = options;

    if (!file) {
      resolve({
        isValid: false,
        errorMessage: "An image file is required.",
      });
      return;
    }

    // Check file type
    if (!file.type.startsWith("image/")) {
      resolve({
        isValid: false,
        errorMessage: "Selected file is not an image.",
      });
      return;
    }

    // Check file size
    const maxSizeInBytes = maxSizeInMB * 1024 * 1024;
    if (file.size > maxSizeInBytes) {
      resolve({
        isValid: false,
        errorMessage: `Image size must be less than ${maxSizeInMB}MB.`,
      });
      return;
    }

    // Check image dimensions
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
      errorMessage: "Please enter a valid email address."
    };
  }

  return { isValid: true, errorMessage: "" };
};

/**
 * Validates a password
 * @param {string} password - Password to validate
 * @param {object} options - Validation options
 * @param {number} options.minLength - Minimum password length
 * @param {boolean} options.requireUppercase - Whether to require uppercase letters
 * @param {boolean} options.requireNumbers - Whether to require numbers
 * @param {boolean} options.requireSpecial - Whether to require special characters
 * @returns {object} - Validation result {isValid, errorMessage}
 */
export const validatePassword = (password, options = {}) => {
  const {
    minLength = 8,
    requireUppercase = true,
    requireNumbers = true,
    requireSpecial = false,
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

  return { isValid: true, errorMessage: "" };
};
