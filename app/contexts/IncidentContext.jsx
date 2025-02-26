"use client";

import { createContext, useContext, useState } from "react";
import useIncidentProcessor from "../hooks/useIncidentProcessor";

const IncidentContext = createContext(null);

export const IncidentProvider = ({ children, incidents }) => {
  const [selectedIncidents, setSelectedIncidents] = useState([]);
  const [displayedIncident, setDisplayedIncident] = useState(null);
  const [currentIncidentIndex, setCurrentIncidentIndex] = useState(0);
  const [currentDecade, setCurrentDecade] = useState(null);

  const { incidentsByDecade } = useIncidentProcessor(incidents);

  const handleIncidentDoubleClick = (incident) => {
    const index = incidents.findIndex((inc) => inc.id === incident.id);
    setCurrentIncidentIndex(index);
    setDisplayedIncident(incident);
    setCurrentDecade(currentDecade);
  };

  const handleIncidentNavigation = (newIndex) => {
    setCurrentIncidentIndex(newIndex);
    setDisplayedIncident(incidents[newIndex]);
  };

  const value = {
    incidents,
    incidentsByDecade,
    currentDecade,
    setCurrentDecade,
    selectedIncidents,
    setSelectedIncidents,
    displayedIncident,
    setDisplayedIncident,
    currentIncidentIndex,
    handleIncidentDoubleClick,
    handleIncidentNavigation,
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
