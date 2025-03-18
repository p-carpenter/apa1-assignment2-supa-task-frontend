/**
 * Extract year from incident date
 *
 * @param {Object} incident - Incident object
 * @returns {number|null} Year or null if date invalid
 */
export const getIncidentYear = (incident) => {
  if (!incident || !incident.incident_date) return null;
  try {
    return new Date(incident.incident_date).getFullYear();
  } catch (error) {
    console.error("Error extracting year:", error);
    return null;
  }
};

/**
 * Convert severity text to numeric value for sorting
 *
 * @param {string} severity - Severity level
 * @returns {number} Numeric value for sorting
 */
export const getSeverityValue = (severity) => {
  switch (severity) {
    case "Low":
      return 1;
    case "Moderate":
      return 2;
    case "High":
      return 3;
    case "Critical":
      return 4;
    default:
      return 0; // For unknown or undefined values
  }
};

/**
 * Sort incidents by specified order
 *
 * @param {Array} incidents - Incidents to sort
 * @param {string} sortOrder - Sort order (year-asc, year-desc, etc.)
 * @returns {Array} Sorted incidents
 */
export const sortIncidents = (incidents, sortOrder) => {
  if (!incidents || !incidents.length) return [];

  return [...incidents].sort((a, b) => {
    const yearA = getIncidentYear(a) || 0;
    const yearB = getIncidentYear(b) || 0;

    switch (sortOrder) {
      case "year-asc":
        return yearA - yearB;
      case "year-desc":
        return yearB - yearA;
      case "name-asc":
        return a.name.localeCompare(b.name);
      case "name-desc":
        return b.name.localeCompare(a.name);
      case "severity-asc":
        return getSeverityValue(a.severity) - getSeverityValue(b.severity);
      case "severity-desc":
        return getSeverityValue(b.severity) - getSeverityValue(a.severity);
      default:
        return yearB - yearA;
    }
  });
};

/**
 * Filter incidents based on search, categories, and years
 *
 * @param {Array} incidents - Incidents to filter
 * @param {string} searchQuery - Search query
 * @param {Array} selectedYears - Selected years for filtering
 * @param {Array} selectedCategories - Selected categories for filtering
 * @returns {Array} Filtered incidents
 */
export const filterIncidents = (
  incidents,
  searchQuery,
  selectedYears,
  selectedCategories
) => {
  if (!incidents || !incidents.length) return [];

  return incidents.filter((incident) => {
    if (!incident) return false;

    const year = getIncidentYear(incident);

    const matchesYear =
      selectedYears.includes("all") ||
      (year && selectedYears.includes(year.toString()));

    const matchesCategory =
      selectedCategories.includes("all") ||
      (incident.category && selectedCategories.includes(incident.category));

    const matchesSearch =
      searchQuery === "" ||
      (incident.name &&
        incident.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (incident.category &&
        incident.category.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (incident.description &&
        incident.description
          .toLowerCase()
          .includes(searchQuery.toLowerCase())) ||
      (year && year.toString().includes(searchQuery));

    return matchesYear && matchesCategory && matchesSearch;
  });
};
