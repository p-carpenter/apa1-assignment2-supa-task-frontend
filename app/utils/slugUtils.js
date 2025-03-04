/**
 * Generates a URL-friendly slug from an incident name
 * Uses first 2 words of the title for efficiency
 */
export const generateSlug = (incidentName) => {
  if (!incidentName) return "unknown";

  try {
    // Normalize the incident name
    const name = incidentName.toString().trim();

    // Get first 2 words and join with hyphen
    const words = name.split(/\s+/).filter(Boolean);
    const firstTwoWords = words.slice(0, 2).join("-");

    return (
      firstTwoWords
        .toLowerCase()
        .replace(/[^\w\s-]/g, "") // Remove special characters
        .replace(/--+/g, "-") // Remove consecutive hyphens
        .trim() || "unknown"
    ); // Return 'unknown' if empty
  } catch (e) {
    console.error("Error generating slug:", e);
    return "unknown";
  }
};

/**
 * Find an incident by its slug
 */
export const findIncidentBySlug = (incidents, slug) => {
  if (!slug || !incidents?.length) return null;

  // First try exact match
  const incident = incidents.find((inc) => {
    const incSlug = generateSlug(inc.name);
    return incSlug === slug;
  });
  
  if (incident) return incident;

  // If no exact match, try partial match (first word of slug)
  const firstWordOfSlug = slug.split("-")[0];
  return incidents.find((inc) => {
    const incSlug = generateSlug(inc.name);
    return incSlug.startsWith(firstWordOfSlug);
  });
};

/**
 * Get incident index by slug
 */
export const getIncidentIndexBySlug = (incidents, slug) => {
  const incident = findIncidentBySlug(incidents, slug);
  return incident ? incidents.findIndex((inc) => inc.id === incident.id) : -1;
};
