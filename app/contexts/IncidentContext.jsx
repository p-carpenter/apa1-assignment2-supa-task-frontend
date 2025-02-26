"use client";

import { createContext, useContext, useState, useMemo } from "react";

const IncidentContext = createContext(null);

export const IncidentProvider = ({
  children,
  incidents: initialIncidents = [],
}) => {
  const [incidents, setIncidents] = useState(initialIncidents);
  const [selectedIncidents, setSelectedIncidents] = useState([]);
  const [displayedIncident, setDisplayedIncident] = useState(null);
  const [currentIncidentIndex, setCurrentIncidentIndex] = useState(0);
  const [currentDecade, setCurrentDecade] = useState(null);
  const [currentYear, setCurrentYear] = useState(null);

  const calculateDecadeFromYear = (year) => {
    if (!year) return null;
    return Math.floor(year / 10) * 10;
  };

  // Group incidents by decade
  const incidentsByDecade = useMemo(() => {
    return incidents.reduce((acc, incident) => {
      try {
        const year = new Date(incident.incident_date).getFullYear();
        const decade = Math.floor(year / 10) * 10;
        if (!acc[decade]) acc[decade] = [];
        acc[decade].push(incident);
      } catch (error) {
        console.error("Error processing incident:", incident, error);
      }
      return acc;
    }, {});
  }, [incidents]);

  // Handler functions
  const handleIncidentDoubleClick = (incident) => {
    const index = incidents.findIndex((inc) => inc.id === incident.id);
    setCurrentIncidentIndex(index);
    setDisplayedIncident(incident);
  };

  const handleIncidentNavigation = (newIndex) => {
    if (newIndex >= 0 && newIndex < incidents.length) {
      const nextIncident = incidents[newIndex];
      setCurrentIncidentIndex(newIndex);
      setDisplayedIncident(nextIncident);

      // Extract and set the decade from the incident date
      try {
        const year = new Date(nextIncident.incident_date).getFullYear();
        const decade = calculateDecadeFromYear(year);
        setCurrentDecade(decade);
      } catch (error) {
        console.error(
          "Error extracting decade from incident:",
          nextIncident,
          error
        );
      }
    }
  };

  // View management functions
  const handleFolderDoubleClick = (decade) => {
    setCurrentYear(decade);
    setSelectedIncidents([]);
    setCurrentDecade(decade);
  };

  const navigateToRoot = () => {
    setCurrentYear(null);
    setSelectedIncidents([]);
    setCurrentDecade(null);
  };

  const value = {
    // Data
    incidents,
    setIncidents,
    incidentsByDecade,
    // Selection state
    selectedIncidents,
    setSelectedIncidents,
    displayedIncident,
    setDisplayedIncident,
    currentIncidentIndex,
    // Navigation state
    currentDecade,
    setCurrentDecade,
    currentYear,
    setCurrentYear,
    // Action handlers
    handleIncidentDoubleClick,
    handleIncidentNavigation,
    handleFolderDoubleClick,
    navigateToRoot,
  };

  return (
    <IncidentContext.Provider value={value}>
      {children}
    </IncidentContext.Provider>
  );
};

export const useIncidents = () => {
  const context = useContext(IncidentContext);
  if (!context)
    throw new Error("useIncidents must be used within an IncidentProvider");
  return context;
};
