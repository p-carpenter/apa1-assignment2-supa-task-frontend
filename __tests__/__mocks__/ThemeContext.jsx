import React, { createContext, useContext } from "react";
import { useIncidents } from "@/app/contexts/IncidentContext";

const ThemeContext = createContext({});

export const useTheme = () => useContext(ThemeContext);

export const ThemeProvider = ({ children }) => {
  const { currentDecade } = useIncidents();

  // Ensure a valid decade
  const validDecade = [1980, 1990, 2000, 2010, 2020].includes(currentDecade)
    ? currentDecade
    : 1990;

  const themeConfigs = {
    1980: { frameType: "dos", maxHeight: 600, contentPadding: "medium" },
    1990: { frameType: "win95", maxHeight: 640, contentPadding: "small" },
    2000: { frameType: "geocities", maxHeight: 680, contentPadding: "medium" },
    2010: { frameType: "android", maxHeight: 690, contentPadding: "small" },
    2020: { frameType: "zoom", maxHeight: 700, contentPadding: "small" },
  };

  return (
    <ThemeContext.Provider
      value={{
        decade: validDecade,
        decadeConfig: themeConfigs[validDecade],
        artifactWidth: 863,
        IncidentDetailsWindows: () => (
          <div data-testid={`mock-incident-window-${validDecade}`}>
            Mock Incident Window {validDecade}
          </div>
        ),
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};
