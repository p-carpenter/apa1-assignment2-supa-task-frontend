import { useMemo } from "react";
import { calculateDecade, extractYear } from "../utils/dateUtils";

const useIncidentProcessor = (incidents = []) => {
  // Group incidents by decade
  const incidentsByDecade = useMemo(() => {
    return incidents.reduce((acc, incident) => {
      const year = extractYear(incident.incident_date);
      const decade = calculateDecade(year);
      if (!decade) return acc;

      if (!acc[decade]) acc[decade] = [];
      acc[decade].push(incident);
      return acc;
    }, {});
  }, [incidents]);

  return { incidentsByDecade };
};

export default useIncidentProcessor;
