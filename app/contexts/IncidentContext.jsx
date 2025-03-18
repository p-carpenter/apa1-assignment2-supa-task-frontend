"use client";

import {
  createContext,
  useContext,
  useState,
  useMemo,
  useCallback,
  useEffect,
  useRef,
} from "react";

const IncidentContext = createContext(null);

export const IncidentProvider = ({
  children,
  incidents: initialIncidents = [],
}) => {
  const [incidents, setIncidents] = useState(initialIncidents);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedIncidents, setSelectedIncidents] = useState([]);
  const [displayedIncident, setDisplayedIncident] = useState(null);
  const [currentIncidentIndex, setCurrentIncidentIndex] = useState(0);
  const [currentDecade, setCurrentDecade] = useState(null);
  const [currentYear, setCurrentYear] = useState(null);
  const [activeFilter, setActiveFilter] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const hasInitialFetchRef = useRef(false);

  // Auto-fetch incidents on initial mount
  useEffect(() => {
    // If we already have data in initialIncidents prop
    if (initialIncidents && initialIncidents.length > 0) {
      setIncidents(initialIncidents);
      hasInitialFetchRef.current = true;
      setIsLoading(false);
      return;
    }

    // If we've already fetched data, don't fetch again
    if (hasInitialFetchRef.current) {
      return;
    }

    // Try to get data from session storage
    try {
      const sessionData = sessionStorage.getItem("incidents");
      if (sessionData) {
        const parsedData = JSON.parse(sessionData);
        if (parsedData && Array.isArray(parsedData) && parsedData.length > 0) {
          console.log(
            `Loaded ${parsedData.length} incidents from session storage`
          );
          setIncidents(parsedData);
          hasInitialFetchRef.current = true;
          setIsLoading(false);
          return;
        }
      }
    } catch (error) {
      console.error("Error accessing session storage:", error);
    }

    // If no data found, fetch from API
    fetchIncidents();
  }, [initialIncidents]);

  const fetchIncidents = useCallback(async () => {
    // Using ref to prevent refetching
    if (hasInitialFetchRef.current) {
      return incidents;
    }

    setIsLoading(true);

    try {
      console.log("Fetching incidents from API...");
      const response = await fetch("/api/fetch-incidents");

      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }

      const data = await response.json();
      console.log(`Fetched ${data.length} incidents successfully`);

      // Save to session storage to prevent refetching on browser refresh
      try {
        sessionStorage.setItem("incidents", JSON.stringify(data));
      } catch (error) {
        console.error("Failed to save incidents to session storage:", error);
      }

      setIncidents(data);
      hasInitialFetchRef.current = true;
      return data;
    } catch (error) {
      console.error("Failed to fetch incidents:", error);
      return [];
    } finally {
      setIsLoading(false);
    }
  }, []);

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

  const navigateToRoot = () => {
    setCurrentYear(null);
    setSelectedIncidents([]);
    setCurrentDecade(null);
  };

  const value = useMemo(
    () => ({
      // Data
      incidents,
      setIncidents,
      incidentsByDecade,
      fetchIncidents,
      isLoading,
      setIsLoading,
      hasInitialFetch: hasInitialFetchRef.current,
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
      handleIncidentNavigation,
      navigateToRoot,
    }),
    [
      incidents,
      incidentsByDecade,
      fetchIncidents,
      isLoading,
      selectedIncidents,
      displayedIncident,
      currentIncidentIndex,
      currentDecade,
      currentYear,
      activeFilter,
      searchQuery,
      filteredIncidents,
      clearFilters,
      handleFilterClick,
    ]
  );

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
