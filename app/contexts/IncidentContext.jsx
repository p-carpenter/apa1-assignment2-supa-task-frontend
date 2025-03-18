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
  const [error, setError] = useState(null);
  const [selectedIncidents, setSelectedIncidents] = useState([]);
  const [displayedIncident, setDisplayedIncident] = useState(null);
  const [currentIncidentIndex, setCurrentIncidentIndex] = useState(0);
  const [currentDecade, setCurrentDecade] = useState(null);
  const [currentYear, setCurrentYear] = useState(null);
  const [activeFilter, setActiveFilter] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const hasInitialFetchRef = useRef(false);
  const retryCount = useRef(0);
  const maxRetries = 3;

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
    setError(null);

    try {
      // Network connectivity check
      if (typeof window !== "undefined" && !window.navigator.onLine) {
        throw new Error("You appear to be offline. Please check your internet connection.");
      }

      console.log("Fetching incidents from API...");
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10s timeout
      
      const response = await fetch("/api/fetch-incidents", {
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Error fetching incidents: ${response.status}`);
      }

      const data = await response.json();
      
      // Validate the response data
      if (!data || !Array.isArray(data)) {
        throw new Error("Invalid response format: expected an array of incidents");
      }
      
      console.log(`Fetched ${data.length} incidents successfully`);

      // Save to session storage to prevent refetching on browser refresh
      try {
        sessionStorage.setItem("incidents", JSON.stringify(data));
      } catch (storageError) {
        console.warn("Failed to save incidents to session storage:", storageError);
      }

      setIncidents(data);
      hasInitialFetchRef.current = true;
      retryCount.current = 0; // Reset retry count on success
      return data;
    } catch (error) {
      console.error("Failed to fetch incidents:", error);
      
      // Set user-friendly error message
      let errorMessage = "Failed to load incidents. Please try refreshing the page.";
      
      if (error.name === "AbortError") {
        errorMessage = "Request timed out. Please try again.";
      } else if (error.message.includes("offline")) {
        errorMessage = "You appear to be offline. Please check your internet connection.";
      } else if (error.message.includes("Invalid response format")) {
        errorMessage = "We received unexpected data from the server. Please refresh the page.";
      } else if (error.status === 403 || error.status === 401) {
        errorMessage = "You don't have permission to view incidents. Please sign in again.";
      } else if (error.status >= 500) {
        errorMessage = "Our servers are currently experiencing issues. Please try again later.";
      }
      
      setError(errorMessage);
      
      // Implement retry with exponential backoff
      if (retryCount.current < maxRetries) {
        const backoffTime = Math.pow(2, retryCount.current) * 1000; // Exponential backoff
        console.log(`Retrying in ${backoffTime}ms (attempt ${retryCount.current + 1}/${maxRetries})...`);
        
        setTimeout(() => {
          retryCount.current += 1;
          fetchIncidents();
        }, backoffTime);
      }
      
      // Try to get data from session storage as fallback
      try {
        const cachedData = sessionStorage.getItem("incidents");
        if (cachedData) {
          const parsedData = JSON.parse(cachedData);
          if (Array.isArray(parsedData) && parsedData.length > 0) {
            console.log(`Loaded ${parsedData.length} incidents from session storage as fallback`);
            setIncidents(parsedData);
            setError(null); // Clear error as we have data
            // We don't set hasInitialFetchRef to true so it will try to fetch fresh data on next attempt
          }
        }
      } catch (storageError) {
        console.error("Error accessing session storage:", storageError);
      }
      
      return [];
    } finally {
      setIsLoading(false);
    }
  }, [incidents]);

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
          incident && 
          incident.category &&
          incident.category.toLowerCase() === activeFilter.toLowerCase()
      );
    }

    if (searchQuery && searchQuery.trim() !== "") {
      const query = searchQuery.toLowerCase().trim();
      result = result.filter((incident) => {
        if (!incident) return false;
        
        return (
          (incident.name && incident.name.toLowerCase().includes(query)) ||
          (incident.description &&
            incident.description.toLowerCase().includes(query)) ||
          (incident.category && 
            incident.category.toLowerCase().includes(query))
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

  const handleIncidentNavigation = useCallback((newIndex) => {
    if (!Array.isArray(incidents) || incidents.length === 0) {
      console.warn("Cannot navigate: incidents array is empty or invalid");
      return;
    }
    
    if (newIndex < 0 || newIndex >= incidents.length) {
      console.warn(`Invalid index: ${newIndex}. Valid range is 0-${incidents.length - 1}`);
      return;
    }

    try {
      const nextIncident = incidents[newIndex];
      if (!nextIncident) {
        console.warn(`No incident found at index ${newIndex}`);
        return;
      }
      
      setCurrentIncidentIndex(newIndex);
      setDisplayedIncident(nextIncident);

      // Extract year and decade
      if (nextIncident.incident_date) {
        const year = new Date(nextIncident.incident_date).getFullYear();
        const decade = calculateDecadeFromYear(year);
        setCurrentDecade(decade);
      } else {
        console.warn("Incident has no date:", nextIncident);
      }
    } catch (error) {
      console.error("Error during incident navigation:", error);
    }
  }, [incidents, calculateDecadeFromYear]);

  const navigateToRoot = useCallback(() => {
    try {
      setCurrentYear(null);
      setSelectedIncidents([]);
      setCurrentDecade(null);
    } catch (error) {
      console.error("Error navigating to root:", error);
    }
  }, []);

  const refreshIncidents = useCallback(async () => {
    // Force a refresh of the incidents data
    hasInitialFetchRef.current = false;
    setError(null);
    return fetchIncidents();
  }, [fetchIncidents]);

  const value = useMemo(
    () => ({
      // Data
      incidents,
      setIncidents,
      incidentsByDecade,
      fetchIncidents,
      refreshIncidents,
      isLoading,
      setIsLoading,
      error,
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
      refreshIncidents,
      isLoading,
      error,
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
      handleIncidentNavigation,
      navigateToRoot,
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
