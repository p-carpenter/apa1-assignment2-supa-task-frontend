import { useMemo } from "react";
import { useIncidents } from "../contexts/IncidentContext";
import { useRouter } from "next/navigation";

const useViewManager = (filteredIncidents) => {
  const router = useRouter();
  const {
    incidents,
    incidentsByDecade,
    currentDecade,
    currentYear,
    setSelectedIncidents,
    handleFolderDoubleClick,
    navigateToRoot,
    setDisplayedIncident,
    setCurrentIncidentIndex,
  } = useIncidents();

  // Get all decades from incidentsByDecade
  const decades = useMemo(() => {
    return Object.keys(incidentsByDecade)
      .map(Number)
      .sort((a, b) => a - b);
  }, [incidentsByDecade]);

  // Filter decades based on filteredIncidents
  const filteredDecades = useMemo(() => {
    if (!filteredIncidents?.length) return decades;

    return decades.filter((decade) =>
      incidentsByDecade[decade]?.some((incident) =>
        filteredIncidents.includes(incident)
      )
    );
  }, [decades, incidentsByDecade, filteredIncidents]);

  // Get visible incidents for the current year, filtered by search/category
  const visibleIncidents = useMemo(() => {
    if (!currentYear) return [];
    if (!filteredIncidents?.length) return [];

    return (
      incidentsByDecade[currentYear]?.filter((incident) =>
        filteredIncidents.includes(incident)
      ) || []
    );
  }, [currentYear, incidentsByDecade, filteredIncidents]);

  // Determine current view based on currentYear
  const currentView = currentYear ? "incidents" : "years";

  // Handle clicking on an incident directly
  const handleIncidentClick = (incident) => {
    // Set the incident in context for the gallery page
    const index = incidents.findIndex((inc) => inc.id === incident.id);
    if (index >= 0) {
      setCurrentIncidentIndex(index);
      setDisplayedIncident(incident);
    }
  };

  return {
    currentView,
    currentYear,
    decades,
    filteredDecades,
    visibleIncidents,
    // Navigation methods
    handleFolderDoubleClick,
    handleIncidentClick,
    navigateToRoot,
  };
};

export default useViewManager;
