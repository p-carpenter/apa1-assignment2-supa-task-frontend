/**
 * Formats a date to display format (DD-MM-YYYY).
 *
 * @param {string|Date} date - A date string (YYYY-MM-DD, ISO) or a Date object.
 * @param {string} [separator='-'] - The separator for the output format.
 * @returns {string} Formatted date (DD-MM-YYYY) or an empty string if invalid.
 */
export const formatDateForDisplay = (date, separator = "-") => {
  if (!date) return "";

  let dateObj = date instanceof Date ? date : new Date(date);

  // If string, handle specific formats
  if (typeof date === "string") {
    if (/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      const [year, month, day] = date.split("-").map(Number);
      dateObj = new Date(year, month - 1, day);
    } else if (/^\d{2}-\d{2}-\d{4}$/.test(date)) {
      return date; // Already in the correct format
    }
  }

  // Validate date
  if (isNaN(dateObj.getTime())) {
    console.warn(`Invalid date input: ${date}`);
    return "";
  }

  const day = String(dateObj.getDate()).padStart(2, "0");
  const month = String(dateObj.getMonth() + 1).padStart(2, "0");
  const year = dateObj.getFullYear();

  return [day, month, year].join(separator);
};

/**
 * Parses a date string in DD-MM-YYYY format into a Date object.
 *
 * @param {string} dateString - A date string in DD-MM-YYYY format.
 * @returns {Date|null} Parsed Date object or null if invalid.
 */
export const parseDate = (dateString) => {
  if (!dateString || !/^\d{2}-\d{2}-\d{4}$/.test(dateString)) {
    console.warn(`Invalid format: ${dateString}`);
    return null;
  }

  const [day, month, year] = dateString.split("-").map(Number);
  const date = new Date(year, month - 1, day);

  // Ensure the parsed date matches the expected values (prevents invalid rollovers)
  if (
    date.getFullYear() !== year ||
    date.getMonth() + 1 !== month ||
    date.getDate() !== day
  ) {
    console.warn(`Invalid date: ${dateString}`);
    return null;
  }

  return date;
};

/**
 * Formats a date input dynamically with automatic hyphen insertion.
 *
 * @param {string} input - Raw user input for a date.
 * @returns {string} Formatted input with hyphens (DD-MM-YYYY).
 */
export const formatDateInput = (input) => {
  if (!input) return "";

  // Remove non-digit characters
  const digits = input.replace(/\D/g, "");

  // Apply formatting dynamically
  return [digits.slice(0, 2), digits.slice(2, 4), digits.slice(4, 8)]
    .filter(Boolean) // Remove empty parts
    .join("-");
};
