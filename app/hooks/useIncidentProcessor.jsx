import { useMemo } from "react";

const useIncidentProcessor = (incidents = []) => {
  // Group incidents by decade
  const incidentsByDecade = useMemo(() => {
    return incidents.reduce((acc, incident) => {
      const year = new Date(incident.incident_date).getFullYear();
      const decade = Math.floor(year / 10) * 10;
      if (!acc[decade]) {
        acc[decade] = [];
      }
      acc[decade].push(incident);
      return acc;
    }, {});
  }, [incidents]);

  // Extract sorted decades
  const decades = useMemo(() => {
    return Object.keys(incidentsByDecade).sort();
  }, [incidentsByDecade]);

  return {
    incidentsByDecade,
    decades,
  };
};

export default useIncidentProcessor;
