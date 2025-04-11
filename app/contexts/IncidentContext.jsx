"use client";

import {
  createContext,
  useContext,
  useState,
  useMemo,
  useCallback,
  useEffect,
} from "react";
import { processApiError, getErrorMessage } from "../utils/errors/errorService";

const IncidentContext = createContext(null);

/**
 * Provider component for incident data and operations
 *
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Child components
 * @param {Array} [props.incidents=[]] - Initial incidents data
 */
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

  /**
   * initialises incidents data from props or session storage
   */
  useEffect(() => {
    if (initialIncidents.length > 0) {
      setIncidents(initialIncidents);
      setIsLoading(false);
    } else {
      loadIncidentsFromSessionStorage();
    }
    fetchIncidents();
  }, []);

  /**
   * Attempts to load incidents from session storage
   *
   * @returns {boolean} Whether incidents were successfully loaded
   */
  const loadIncidentsFromSessionStorage = () => {
    try {
      const sessionData = sessionStorage.getItem("incidents");
      if (sessionData) {
        const parsedData = JSON.parse(sessionData);
        if (Array.isArray(parsedData) && parsedData.length > 0) {
          setIncidents(parsedData);
          setIsLoading(false);
          return true;
        }
      }
    } catch (error) {
      console.error("Error parsing session storage data:", error);
    }
    return false;
  };

  /**
   * Saves incidents data to session storage
   *
   * @param {Array} data - Incidents data to save
   */
  const saveIncidentsToSessionStorage = (data) => {
    try {
      sessionStorage.setItem("incidents", JSON.stringify(data));
    } catch (storageError) {
      console.warn(
        "Failed to save incidents to session storage:",
        storageError
      );
    }
  };

  /**
   * Fetches incidents data from the API
   */
  const fetchIncidents = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Check for offline status
      if (typeof window !== "undefined" && !window.navigator.onLine) {
        throw new Error(
          "You appear to be offline. Please check your internet connection."
        );
      }

      const data = await fetchIncidentsWithTimeout();
      setIncidents(data);
      saveIncidentsToSessionStorage(data);
    } catch (error) {
      handleFetchError(error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Fetches incidents with a timeout
   *
   * @returns {Promise<Array>} Fetched incidents data
   * @throws {Error} Fetch error
   */
  const fetchIncidentsWithTimeout = async () => {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10s timeout

    try {
      const response = await fetch("/api/fetch-incidents", {
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw processApiError(errorData, {
          defaultMessage: "Something went wrong when fetching incidents.",
        });
      }

      const result = await response.json();

      if (!result?.data || !Array.isArray(result.data)) {
        console.warn("No incidents found in API response.");
        return [];
      }

      return result.data;
    } catch (error) {
      clearTimeout(timeoutId);
      throw error;
    }
  };

  /**
   * Handles errors during incident fetching
   *
   * @param {Error} error - The error that occurred
   */
  const handleFetchError = (error) => {
    console.error("Failed to fetch incidents:", processApiError(error));

    setError(
      getErrorMessage(
        processApiError(error, {
          defaultMessage: "Failed to load incidents.",
        })
      )
    );

    // Try to load from session storage as a fallback
    const loaded = loadIncidentsFromSessionStorage();
    if (loaded) {
      setError(null);
    }
  };

  /**
   * Calculates the decade from a given year
   *
   * @param {number} year - Year to calculate decade from
   * @returns {number|null} Decade (e.g., 1990) or null if year is invalid
   */
  const calculateDecadeFromYear = (year) => {
    if (!year) return null;
    return Math.floor(year / 10) * 10;
  };

  /**
   * Groups incidents by decade
   */
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

  /**
   * Handles navigation to a specific incident by index
   *
   * @param {number} newIndex - Index of the incident to navigate to
   */
  const handleIncidentNavigation = useCallback(
    (newIndex) => {
      if (!Array.isArray(incidents) || incidents.length === 0) {
        console.warn("Cannot navigate: incidents array is empty or invalid");
        return;
      }

      if (newIndex < 0 || newIndex >= incidents.length) {
        console.warn(
          `Invalid index: ${newIndex}. Valid range is 0-${incidents.length - 1}`
        );
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
    },
    [incidents]
  );

  /**
   * Navigates back to the root view (all decades)
   */
  const navigateToRoot = useCallback(() => {
    try {
      setCurrentYear(null);
      setSelectedIncidents([]);
      setCurrentDecade(null);
    } catch (error) {
      console.error("Error navigating to root:", error);
    }
  }, []);

  /**
   * Memoized context value
   */
  const value = useMemo(
    () => ({
      // Data
      incidents,
      setIncidents,
      incidentsByDecade,
      fetchIncidents,
      isLoading,
      setIsLoading,
      error,
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
      // Action handlers
      handleIncidentNavigation,
      navigateToRoot,
    }),
    [
      incidents,
      incidentsByDecade,
      fetchIncidents,
      isLoading,
      error,
      selectedIncidents,
      displayedIncident,
      currentIncidentIndex,
      currentDecade,
      currentYear,
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

/**
 * Custom hook to use the incident context
 *
 * @returns {Object} Incident context value
 * @throws {Error} If used outside of IncidentProvider
 */
export const useIncidents = () => {
  const context = useContext(IncidentContext);
  if (!context)
    throw new Error("useIncidents must be used within an IncidentProvider");
  return context;
};
