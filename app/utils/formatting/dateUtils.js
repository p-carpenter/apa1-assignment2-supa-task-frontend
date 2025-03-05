/**
 * Formats an ISO date string into a human-readable format
 * @param {string} isoDateString - The ISO date string to format
 * @param {string} format - Format style ('short', 'medium', 'long', 'full') or custom format string
 * @returns {string} Formatted date string
 */
export function formatDate(isoDateString, format = "medium") {
  if (!isoDateString) return "";

  try {
    const date = new Date(isoDateString);

    // Check if valid date
    if (isNaN(date.getTime())) {
      return isoDateString; // Return original if invalid
    }

    // Custom formats
    if (format === "dos") {
      // DOS style format: DD.MM.YY
      const day = String(date.getDate()).padStart(2, "0");
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const year = String(date.getFullYear()).slice(-2);
      return `${day}.${month}.${year}`;
    }

    // Predefined format options
    const options = {
      short: { month: "numeric", day: "numeric", year: "numeric" },
      medium: { month: "short", day: "numeric", year: "numeric" },
      long: { month: "long", day: "numeric", year: "numeric" },
      full: { weekday: "long", month: "long", day: "numeric", year: "numeric" },
    };

    return date.toLocaleDateString(
      undefined,
      options[format] || options.medium
    );
  } catch (error) {
    console.error("Error formatting date:", error);
    return isoDateString;
  }
}

/**
 * Extract year from an ISO date string
 * @param {string} isoDateString - The ISO date string
 * @returns {number|null} The year or null if invalid
 */
export function extractYear(isoDateString) {
  if (!isoDateString) return null;

  try {
    const date = new Date(isoDateString);
    return isNaN(date.getTime()) ? null : date.getFullYear();
  } catch (error) {
    console.error("Error extracting year:", error);
    return null;
  }
}

/**
 * Calculate decade from a year or date string
 * @param {number|string} yearOrDate - Year number or ISO date string
 * @returns {number|null} The decade (e.g., 2020) or null if invalid
 */
export function calculateDecade(yearOrDate) {
  if (!yearOrDate) return null;

  try {
    let year;
    if (typeof yearOrDate === "number") {
      year = yearOrDate;
    } else {
      const date = new Date(yearOrDate);
      if (isNaN(date.getTime())) return null;
      year = date.getFullYear();
    }

    return Math.floor(year / 10) * 10;
  } catch (error) {
    console.error("Error calculating decade:", error);
    return null;
  }
}
