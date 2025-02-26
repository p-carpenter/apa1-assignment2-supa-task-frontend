import { useMemo } from "react";
import { useIncidents } from "../contexts/IncidentContext";

const useViewManager = (filteredIncidents) => {
  const {
    incidentsByDecade,
    currentDecade,
    currentYear,
    setSelectedIncidents,
    handleFolderDoubleClick,
    handleIncidentDoubleClick,
    navigateToRoot,
  } = useIncidents();

  // Get all decades from incidentsByDecade
  const decades = useMemo(() => {
    return Object.keys(incidentsByDecade)
      .map(Number)
      .sort((a, b) => a - b);
  }, [incidentsByDecade]);

  // Filter decades based on filteredIncidents
  const filteredDecades = useMemo(() => {
    return decades.filter((decade) =>
      incidentsByDecade[decade]?.some((incident) =>
        filteredIncidents.includes(incident)
      )
    );
  }, [decades, incidentsByDecade, filteredIncidents]);

  // Get visible incidents for the current year
  const visibleIncidents = useMemo(() => {
    if (!currentYear) return [];
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
    handleIncidentDoubleClick(incident);
  };

  return {
    currentView,
    currentYear,
    currentDecade,
    decades,
    filteredDecades,
    visibleIncidents,
    // Navigation methods
    handleFolderDoubleClick,
    handleIncidentClick,
    navigateToRoot,
    // Path information
    currentPath: `C:\\Technology Incidents${currentDecade ? `\\${currentDecade}s` : ""}\\`,
    windowTitle: `Technology Incidents${currentDecade ? ` - ${currentDecade}s` : ""}`,
  };
};

export default useViewManager;
