"use client";

import {
  createContext,
  useContext,
  useState,
  useMemo,
  useCallback,
} from "react";

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
  const [activeFilter, setActiveFilter] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");

  const calculateDecadeFromYear = (year) => {
    if (!year) return null;
    return Math.floor(year / 10) * 10;
  };

  const incidentsByDecade = useMemo(() => {

    if (!Array.isArray(incidents)) {
      console.warn("incidents is not an array:", incidents);
      return {};
    }
    
    return incidents.reduce((acc, incident) => {
      if (!incident) return acc;
      
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


  const filteredIncidents = useMemo(() => {

    if (!Array.isArray(incidents) || !incidents.length) return [];

    let result = [...incidents];

    if (activeFilter) {
      result = result.filter(
        (incident) =>
          incident.category &&
          incident.category.toLowerCase() === activeFilter.toLowerCase()
      );
    }

    if (searchQuery && searchQuery.trim() !== "") {
      const query = searchQuery.toLowerCase().trim();
      result = result.filter((incident) => {
        return (
          (incident.name && incident.name.toLowerCase().includes(query)) ||
          (incident.description &&
            incident.description.toLowerCase().includes(query))
        );
      });
    }

    return result;
  }, [incidents, activeFilter, searchQuery]);


  const clearFilters = useCallback(() => {
    setActiveFilter(null);
    setSearchQuery("");
  }, []);


  const handleFilterClick = useCallback((category) => {
    setActiveFilter((prevFilter) =>
      prevFilter === category ? null : category
    );
  }, []);


  const handleIncidentDoubleClick = (incident) => {
    if (!Array.isArray(incidents)) return;
    
    const index = incidents.findIndex((inc) => inc.id === incident.id);
    setCurrentIncidentIndex(index);
    setDisplayedIncident(incident);
  };

  const handleIncidentNavigation = (newIndex) => {
    if (!Array.isArray(incidents)) return;
    
    if (newIndex >= 0 && newIndex < incidents.length) {
      const nextIncident = incidents[newIndex];
      setCurrentIncidentIndex(newIndex);
      setDisplayedIncident(nextIncident);


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
    setCurrentIncidentIndex,
    // Navigation state
    currentDecade,
    setCurrentDecade,
    currentYear,
    setCurrentYear,
    // Filter state
    activeFilter,
    setActiveFilter,
    searchQuery,
    setSearchQuery,
    filteredIncidents,
    clearFilters,
    handleFilterClick,
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