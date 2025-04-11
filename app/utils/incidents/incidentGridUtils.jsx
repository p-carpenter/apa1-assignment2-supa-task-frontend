/**
 * Extract year from incident date
 *
 * @param {Object} incident - The incident object containing date information
 * @param {string} incident.incident_date - ISO date string of the incident
 * @returns {number|null} The extracted year as a number, or null if date is invalid
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
 * @param {string} severity - The severity level text ('Low', 'Moderate', 'High', 'Critical')
 * @returns {number} Numeric value for sorting (0-4, where 4 is most severe)
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
      return 0;
  }
};

/**
 * Sort incidents by specified order
 *
 * @param {Array<Object>} incidents - Array of incident objects to sort
 * @param {string} sortOrder - Sort order string ('year-asc', 'year-desc', 'name-asc', 'name-desc', 'severity-asc', 'severity-desc')
 * @returns {Array<Object>} New array of sorted incidents
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
        // default to most recent first
        return yearB - yearA;
    }
  });
};

/**
 * Check if an incident matches the search query
 *
 * @param {Object} incident - Incident object to check
 * @param {string} query - Search query
 * @returns {boolean} True if incident matches the search query
 */
const matchesSearch = (incident, query) => {
  // Empty query always matches
  if (!query) return true;
  if (!incident) return false;

  const year = getIncidentYear(incident);
  const yearStr = year ? year.toString() : '';
  
  const searchableFields = [
    incident.name || '',
    incident.category || '',
    incident.description || '',
    yearStr
  ];
  
  const normalisedQuery = query.toLowerCase();
  

  return searchableFields.some(field => 
    field.toLowerCase().includes(normalisedQuery)
  );
};

/**
 * Filter incidents based on search query, selected years, and categories
 *
 * @param {Array<Object>} incidents - Array of incident objects to filter
 * @param {string} searchQuery - Text to search for in incident properties
 * @param {Array<string>} selectedYears - Years to include (contains 'all' or specific years as strings)
 * @param {Array<string>} selectedCategories - Categories to include (contains 'all' or specific category names)
 * @returns {Array<Object>} Filtered array of incidents matching all criteria
 */
export const filterIncidents = (
  incidents,
  searchQuery,
  selectedYears,
  selectedCategories
) => {
  if (!incidents || !incidents.length) return [];
  
  const query = searchQuery.trim();

  return incidents.filter((incident) => {
    if (!incident) return false;

    const year = getIncidentYear(incident);
    const matchesYear =
      selectedYears.includes("all") ||
      (year && selectedYears.includes(year.toString()));


    const matchesCategory =
      selectedCategories.includes("all") ||
      (incident.category && selectedCategories.includes(incident.category));


    const searchMatches = matchesSearch(incident, query);

    return matchesYear && matchesCategory && searchMatches;
  });
};
