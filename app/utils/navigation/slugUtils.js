/**
 * Generates a URL-friendly slug from an incident name
 * Uses first 2 words of the title for efficiency
 * 
 * @param {string} incidentName - The name of the incident to convert to a slug
 * @returns {string} A URL-friendly slug generated from the incident name, or "unknown" if generation fails
 * @example
 * // returns "database-outage"
 * generateSlug("Database Outage in Production")
 */
export const generateSlug = (incidentName) => {
  if (!incidentName) return "unknown";

  try {
    const name = incidentName.toString().trim();

    const words = name.split(/\s+/).filter(Boolean);

    let slug = words.slice(0, 2).join("-");

    slug = slug
      .toLowerCase()
      .replace(/[^\w\s-]/g, "")
      .replace(/[\s_-]+/g, "-")
      .replace(/^-+|-+$/g, "");

    return slug || "unknown";
  } catch (e) {
    console.error("Error generating slug:", e);
    return "unknown";
  }
};

/**
 * Find an incident by its slug in an array of incidents
 * First tries exact slug match, then falls back to partial match using the first word
 * 
 * @param {Array<Object>} incidents - Array of incident objects to search through
 * @param {string} slug - The slug to search for
 * @returns {Object|null} The matched incident object or null if no match is found
 * @example
 * // returns the incident object if found
 * findIncidentBySlug(incidentsList, "database-outage")
 */
export const findIncidentBySlug = (incidents, slug) => {
  if (!slug || !incidents?.length) return null;

  const incident = incidents.find((inc) => {
    const incSlug = generateSlug(inc.name);
    return incSlug === slug;
  });

  if (incident) return incident;

  const firstWordOfSlug = slug.split("-")[0];
  const partialMatch = incidents.find((inc) => {
    const incSlug = generateSlug(inc.name);
    return incSlug.startsWith(firstWordOfSlug);
  });

  return partialMatch || null;
};

/**
 * Get the index of an incident in an array by its slug
 * 
 * @param {Array<Object>} incidents - Array of incident objects to search through
 * @param {string} slug - The slug to search for
 * @returns {number} The index of the incident in the array, or -1 if not found
 * @example
 * // returns the index number (e.g., 3) if found, or -1 if not found
 * getIncidentIndexBySlug(incidentsList, "database-outage")
 */
export const getIncidentIndexBySlug = (incidents, slug) => {
  const incident = findIncidentBySlug(incidents, slug);
  return incident ? incidents.findIndex((inc) => inc.id === incident.id) : -1;
};