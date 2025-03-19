/**
 * Date formatting utilities with improved error handling
 */

/**
 * Formats a date string to display format (DD-MM-YYYY)
 *
 * @param {string|Date} date - Date to format (YYYY-MM-DD string or Date object)
 * @param {string} [separator='-'] - Separator to use in formatted date
 * @returns {string} Formatted date string or empty string if invalid
 */
export const formatDateForDisplay = (date, separator = "-") => {
  if (!date) return "";

  try {
    let dateObj;

    if (date instanceof Date) {
      dateObj = date;
    } else if (typeof date === "string") {
      if (date.includes("T")) {
        // ISO format with time
        dateObj = new Date(date);
      } else if (date.match(/^\d{4}-\d{2}-\d{2}$/)) {
        // YYYY-MM-DD format
        const [year, month, day] = date.split("-");
        dateObj = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
      } else if (date.match(/^\d{2}-\d{2}-\d{4}$/)) {
        // DD-MM-YYYY format (already in display format)
        return date;
      } else {
        dateObj = new Date(date);
      }

      // Check if date is valid
      if (isNaN(dateObj.getTime())) {
        console.warn(`Invalid date string provided: ${date}`);
        return "";
      }
    } else {
      console.warn(`Unsupported date format: ${typeof date}`);
      return "";
    }

    const day = String(dateObj.getDate()).padStart(2, "0");
    const month = String(dateObj.getMonth() + 1).padStart(2, "0");
    const year = dateObj.getFullYear();

    return [day, month, year].join(separator);
  } catch (error) {
    console.error("Error formatting date for display:", error);
    return "";
  }
};

/**
 * Parses a date string in DD-MM-YYYY format into a Date object
 *
 * @param {string} dateString - Date string to parse
 * @returns {Date|null} Parsed Date object or null if invalid
 */
export const parseDate = (dateString) => {
  if (!dateString) return null;

  try {
    // Only handle DD-MM-YYYY format since that's what is used in the UI
    if (dateString.match(/^\d{2}-\d{2}-\d{4}$/)) {
      const [day, month, year] = dateString.split("-");
      const date = new Date(parseInt(year), parseInt(month) - l, parseInt(day));

      if (isNaN(date.getTime())) {
        console.warn(`Invalid DD-MM-YYYY date string: ${dateString}`);
        return null;
      }

      return date;
    } else {
      // For any other format, try standard date parsing
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        console.warn(`Unsupported date format: ${dateString}`);
        return null;
      }
      return date;
    }
  } catch (error) {
    console.error("Error parsing date:", error);
    return null;
  }
};

/**
 * Formats a date input with automatic hyphen insertion
 *
 * @param {string} input - Raw input from date field
 * @returns {string} Formatted date input with hyphens
 */
export const formatDateInput = (input) => {
  if (!input) return "";

  try {
    // Remove all non-digits
    const digits = input.replace(/\D/g, "");

    // Format based on number of digits
    if (digits.length <= 2) {
      return digits;
    } else if (digits.length <= 4) {
      return `${digits.substring(0, 2)}-${digits.substring(2)}`;
    } else {
      return `${digits.substring(0, 2)}-${digits.substring(2, 4)}-${digits.substring(4, 8)}`;
    }
  } catch (error) {
    console.error("Error formatting date input:", error);
    return input; // Return original input on error
  }
};
