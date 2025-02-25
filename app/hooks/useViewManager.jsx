import { useState, useMemo } from "react";

const useViewManager = (incidents, incidentsByDecade, filteredIncidents) => {
  const [currentView, setCurrentView] = useState("years");
  const [currentYear, setCurrentYear] = useState(null);

  // Get all decades
  const decades = useMemo(() => {
    return Object.keys(incidentsByDecade).sort();
  }, [incidentsByDecade]);

  // Filter decades based on filtered incidents
  const filteredDecades = useMemo(() => {
    if (!filteredIncidents.length) return [];

    return decades.filter((decade) =>
      incidentsByDecade[decade].some((incident) =>
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

  // Navigation handlers
  const navigateToYear = (decade) => {
    setCurrentView("incidents");
    setCurrentYear(decade);
  };

  const navigateToRoot = () => {
    setCurrentView("years");
    setCurrentYear(null);
  };

  // Get current path for address bar
  const currentPath = useMemo(() => {
    return `C:\\Technology Incidents${currentYear ? `\\${currentYear}s` : ""}\\`;
  }, [currentYear]);

  const windowTitle = useMemo(() => {
    return `Technology Incidents${currentYear ? ` - ${currentYear}s` : ""}`;
  }, [currentYear]);

  return {
    currentView,
    currentYear,
    decades,
    filteredDecades,
    visibleIncidents,
    navigateToYear,
    navigateToRoot,
    currentPath,
    windowTitle,
  };
};

export default useViewManager;
