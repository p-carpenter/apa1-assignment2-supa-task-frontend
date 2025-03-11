/**
 * Utility to determine the appropriate decade style for an incident
 * based on its date or fallback to default styling
 */
export const getDecadeStyleForIncident = (incident) => {
  if (!incident || !incident.incident_date) {
    return { name: "default", windowClass: "default" };
  }

  const date = new Date(incident.incident_date);
  const year = date.getFullYear();

  // Determine decade based on year
  if (year >= 1980 && year <= 1989) {
    return { name: "1980s", windowClass: "eighties" };
  }

  if (year >= 1990 && year <= 1999) {
    return { name: "1990s", windowClass: "nineties" };
  }

  if (year >= 2000 && year <= 2009) {
    return { name: "2000s", windowClass: "two_thousands" };
  }

  if (year >= 2010 && year <= 2019) {
    return { name: "2010s", windowClass: "twenty_tens" };
  }

  if (year >= 2020) {
    return { name: "2020s", windowClass: "twenty_twenties" };
  }

  return { name: "default", windowClass: "default" };
};

/**
 * Get a formatted decade label for an incident
 */
export const getDecadeLabel = (incident) => {
  if (!incident || !incident.incident_date) {
    return "Unknown Decade";
  }

  const date = new Date(incident.incident_date);
  const year = date.getFullYear();

  // Round down to the nearest decade
  const decade = Math.floor(year / 10) * 10;

  return `${decade}s`;
};
