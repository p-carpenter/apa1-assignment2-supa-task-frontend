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

  useEffect(() => {
    if (initialIncidents.length > 0) {
      setIncidents(initialIncidents);
      setIsLoading(false);
    } else {
      try {
        const sessionData = sessionStorage.getItem("incidents");
        if (sessionData) {
          const parsedData = JSON.parse(sessionData);
          if (Array.isArray(parsedData) && parsedData.length > 0) {
            setIncidents(parsedData);
            setIsLoading(false);
          }
        }
      } catch (error) {
        console.error("Error parsing session storage data:", error);
      }
    }
    fetchIncidents();
  }, []);

  const fetchIncidents = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      if (typeof window !== "undefined" && !window.navigator.onLine) {
        throw new Error(
          "You appear to be offline. Please check your internet connection."
        );
      }

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10s timeout

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
        setIncidents([]);
        return;
      }

      try {
        sessionStorage.setItem("incidents", JSON.stringify(result.data));
      } catch (storageError) {
        console.warn(
          "Failed to save incidents to session storage:",
          storageError
        );
      }

      setIncidents(result.data);
    } catch (error) {
      console.error("Failed to fetch incidents:", processApiError(error));

      setError(
        getErrorMessage(
          processApiError(error, {
            defaultMessage: "Failed to load incidents.",
          })
        )
      );

      // Try to load from session storage as a fallback
      try {
        const cachedData = sessionStorage.getItem("incidents");
        if (cachedData) {
          const parsedData = JSON.parse(cachedData);
          if (Array.isArray(parsedData) && parsedData.length > 0) {
            setIncidents(parsedData);
            setError(null);
          }
        }
      } catch (storageError) {
        console.error("Error accessing session storage:", storageError);
      }
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
    [incidents, calculateDecadeFromYear]
  );

  const navigateToRoot = useCallback(() => {
    try {
      setCurrentYear(null);
      setSelectedIncidents([]);
      setCurrentDecade(null);
    } catch (error) {
      console.error("Error navigating to root:", error);
    }
  }, []);

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

export const useIncidents = () => {
  const context = useContext(IncidentContext);
  if (!context)
    throw new Error("useIncidents must be used within an IncidentProvider");
  return context;
};
