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
 * Automatically detects ISO dates and converts them to DD-MM-YYYY format.
 *
 * @param {string} input - Raw user input for a date or ISO date string.
 * @returns {string} Formatted input with hyphens (DD-MM-YYYY).
 */
export const formatDateInput = (input) => {
  if (!input) return "";

  // Check if input looks like an ISO date (YYYY-MM-DD)
  const isoDatePattern = /^\d{4}-\d{2}-\d{2}/;
  if (isoDatePattern.test(input)) {
    try {
      const date = new Date(input);
      if (!isNaN(date.getTime())) {
        const day = String(date.getDate()).padStart(2, "0");
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const year = date.getFullYear();
        return `${day}-${month}-${year}`;
      }
    } catch (error) {
      console.warn(`Error processing ISO date: ${error.message}`);
      // Fall through to regular formatting if date parsing fails
    }
  }

  const digits = input.replace(/\D/g, "");

  return [digits.slice(0, 2), digits.slice(2, 4), digits.slice(4, 8)]
    .filter(Boolean)
    .join("-");
};
