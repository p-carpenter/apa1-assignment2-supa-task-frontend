import { useState, useMemo } from "react";
import { useIncidents } from "../contexts/IncidentContext";

const useViewManager = (incidents, incidentsByDecade, filteredIncidents) => {
  const { setCurrentDecade, setSelectedIncidents, handleIncidentDoubleClick } =
    useIncidents();
  const [currentView, setCurrentView] = useState("years");
  const [currentYear, setCurrentYear] = useState(null);

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

  // Calculate current decade based on currentYear - single source of truth
  const currentDecade = useMemo(() => {
    if (!currentYear) return null;
    return Math.floor(currentYear / 10) * 10;
  }, [currentYear]);

  // Get visible incidents for the current year
  const visibleIncidents = useMemo(() => {
    if (!currentYear) return [];
    return (
      incidentsByDecade[currentYear]?.filter((incident) =>
        filteredIncidents.includes(incident)
      ) || []
    );
  }, [currentYear, incidentsByDecade, filteredIncidents]);

  // Enhanced navigation handlers
  const handleFolderDoubleClick = (decade) => {
    setCurrentView("incidents");
    setCurrentYear(decade);
    setSelectedIncidents([]);
    setCurrentDecade(currentDecade);
  };

  const handleIncidentClick = (incident) => {
    handleIncidentDoubleClick(incident);
  };

  const navigateToRoot = () => {
    setCurrentView("years");
    setCurrentYear(null);
    setSelectedIncidents([]);
    setCurrentDecade(null);
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
