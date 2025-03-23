import React, { createContext, useContext } from "react";
import { useIncidents } from "@/app/contexts/IncidentContext";

const IncidentDetailsWindows = {
  1980: ({ incident }) => (
    <div data-testid="1980s-window">
      <p>Title: {incident?.name || "Mock Incident Window 1980"}</p>
      <p>Description: {incident?.description || "No description available"}</p>
    </div>
  ),
  1990: ({ incident }) => (
    <div data-testid="1990s-window">
      <p>Title: {incident?.name || "Mock Incident Window 1990"}</p>
      <p>Description: {incident?.description || "No description available"}</p>
    </div>
  ),
  2000: ({ incident }) => (
    <div data-testid="2000s-window">
      <p>Title: {incident?.name || "Mock Incident Window 2000"}</p>
      <p>Description: {incident?.description || "No description available"}</p>
    </div>
  ),
  2010: ({ incident }) => (
    <div data-testid="2010s-window">
      <p>Title: {incident?.name || "Mock Incident Window 2010"}</p>
      <p>Description: {incident?.description || "No description available"}</p>
    </div>
  ),
  2020: ({ incident }) => (
    <div data-testid="2020s-window">
      <p>Title: {incident?.name || "Mock Incident Window 2020"}</p>
      <p>Description: {incident?.description || "No description available"}</p>
    </div>
  ),
};

// Theme context structure
const ThemeContext = createContext({
  decade: 1990,
  IncidentDetailsWindows: IncidentDetailsWindows[1990],
});

export const useTheme = () => useContext(ThemeContext);

export const ThemeProvider = ({ children }) => {
  const { currentDecade } = useIncidents();

  // Determine the correct decade to use
  const decadeKey = Object.keys(IncidentDetailsWindows).includes(
    String(currentDecade)
  )
    ? currentDecade
    : 1990;

  return (
    <ThemeContext.Provider
      value={{
        decade: decadeKey,
        IncidentDetailsWindows: IncidentDetailsWindows[decadeKey],
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};
