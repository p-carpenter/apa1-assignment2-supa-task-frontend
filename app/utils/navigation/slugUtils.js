/**
 * Generates a URL-friendly slug from an incident name
 * Uses first 2 words of the title for efficiency
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
  const partialMatch = incidents.find((inc) => {
    const incSlug = generateSlug(inc.name);
    return incSlug.startsWith(firstWordOfSlug);
  });

  return partialMatch || null;
};

/**
 * Get incident index by slug
 */
export const getIncidentIndexBySlug = (incidents, slug) => {
  const incident = findIncidentBySlug(incidents, slug);
  return incident ? incidents.findIndex((inc) => inc.id === incident.id) : -1;
};
