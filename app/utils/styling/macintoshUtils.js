/**
 * Utility functions for applying Apple Macintosh styling
 */

/**
 * Gets appropriate class names for elements based on decade
 *
 * @param {string} baseClass - The base CSS class to always include
 * @param {Object} decadeStyle - The decade style configuration
 * @param {string} elementType - The type of element (optional)
 * @returns {string} Combined class names
 */
export const getMacStyleClass = (baseClass, decadeStyle, elementType = "") => {
  if (!decadeStyle) return baseClass;

  // If this is 1980s, add apple-macintosh class
  if (decadeStyle.name === "1980s") {
    return `${baseClass} apple-macintosh`;
  }

  return baseClass;
};

/**
 * Gets the appropriate incident title class based on decade
 *
 * @param {Object} decadeStyle - The decade style configuration
 * @returns {string} The appropriate title class
 */
export const getTitleClass = (decadeStyle) => {
  if (!decadeStyle) return "";

  if (decadeStyle.name === "1980s") {
    return "apple-macintosh title-bar";
  }

  // Map other decades to their title classes
  const titleClasses = {
    "1990s": "incident_title_nineties",
    "2000s": "incident_title_2000s",
    "2010s": "incident_title_2010s",
    "2020s": "incident_title_2020s",
  };

  return titleClasses[decadeStyle.name] || "";
};
