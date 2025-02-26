"use client";

import { useState, useEffect } from "react";
import { IncidentProvider } from "./IncidentContext";
import { ThemeProvider } from "./ThemeContext";

const Providers = ({ children }) => {
  const [incidentData, setIncidentData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load Incidents from DB
  useEffect(() => {
    const fetchIncidents = async () => {
      try {
        setIsLoading(true);
        const response = await fetch("/api/tech-incidents");
        if (!response.ok) throw new Error(`Error: ${response.status}`);
        const data = await response.json();
        setIncidentData(data);
      } catch (error) {
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchIncidents();
  }, []);

  if (isLoading) {
    return <div className="loading">Loading incidents...</div>;
  }

  return (
    <IncidentProvider incidents={incidentData}>
      <ThemeProvider>{children}</ThemeProvider>
    </IncidentProvider>
  );
};

export default Providers;
