/**
 * Generates a URL-friendly slug from an incident name
 * Uses first 2 words of the title for efficiency
 */
export const generateSlug = (incidentName) => {
  if (!incidentName) return "unknown";

  try {
    const name = incidentName.toString().trim();

    const words = name.split(/\s+/).filter(Boolean);
    const firstTwoWords = words.slice(0, 2).join("-");

    return (
      firstTwoWords
        .toLowerCase()
        .replace(/[^\w\s-]/g, "")
        .replace(/--+/g, "-")
        .trim() || "unknown"
    );
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

  const incident = incidents.find((inc) => {
    const incSlug = generateSlug(inc.name);
    return incSlug === slug;
  });

  if (incident) return incident;

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
