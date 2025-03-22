/**
 * Formats a date to medium display format (DD MMM YYYY, e.g., "13 Jan 2023").
 *
 * @param {string|Date|number} date - A date string (any valid format including ISO), Date object, or timestamp.
 * @returns {string} Formatted date in medium format (DD MMM YYYY) or an empty string if invalid.
 */
export const formatDateForDisplay = (date) => {
  if (!date) return "";

  let dateObj;

  try {
    if (date instanceof Date) {
      dateObj = date;
    } else if (typeof date === "string") {
      // Try to parse as an ISO string or any other valid date string
      dateObj = new Date(date);

      // Special handling for DD-MM-YYYY format which JavaScript doesn't parse well
      if (isNaN(dateObj.getTime()) && /^\d{2}-\d{2}-\d{4}$/.test(date)) {
        const [day, month, year] = date.split("-").map(Number);
        dateObj = new Date(year, month - 1, day);
      }
    } else {
      dateObj = new Date(date);
    }

    if (isNaN(dateObj.getTime())) {
      console.warn(`Invalid date input: ${date}`);
      return "";
    }

    return dateObj.toLocaleDateString("en-GB", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  } catch (error) {
    console.warn(`Error formatting date: ${error.message}`);
    return "";
  }
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
