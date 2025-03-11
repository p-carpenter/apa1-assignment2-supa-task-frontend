"use client";

import React, { createContext, useContext } from "react";
import { useIncidents } from "./IncidentContext";
import { getPaddingSizeForArtifact } from "@/app/utils/artifactUtils";

import MacintoshDetailsWindow from "@/app/components/ui/decades/MacintoshDetailsWindow";
import AeroDetailsWindow from "@/app/components/ui/decades/AeroDetailsWindow";
import MaterialDetailsWindow from "@/app/components/ui/decades/MaterialDetailsWindow";
import GlassmorphicDetailsWindow from "@/app/components/ui/decades/GlassmorphicDetailsWindow";
import Win98DetailsWindow from "@/app/components/ui/decades/Win98DetailsWindow";

const IncidentDetailsWindows = {
  1980: MacintoshDetailsWindow,
  1990: Win98DetailsWindow,
  2000: AeroDetailsWindow,
  2010: MaterialDetailsWindow,
  2020: GlassmorphicDetailsWindow,
};

const StandardArtifactWidth = 863;

const DecadeConfigurations = {
  1980: {
    maxHeight: 600,
    frameType: "dos",
    contentPadding: "medium",
  },
  1990: {
    maxHeight: 640,
    frameType: "win95",
    contentPadding: "small",
  },
  2000: {
    maxHeight: 680,
    frameType: "geocities",
    contentPadding: "medium",
  },
  2010: {
    maxHeight: 690,
    frameType: "android",
    contentPadding: "small",
  },
  2020: {
    maxHeight: 700,
    frameType: "zoom",
    contentPadding: "small",
  },
};

// Theme context structure
const ThemeContext = createContext({
  decade: 1990,
  getPaddingSizeForArtifact: getPaddingSizeForArtifact,
  artifactWidth: StandardArtifactWidth,
  decadeConfig: DecadeConfigurations[1990],
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

  const value = {
    decade: decadeKey,
    IncidentDetailsWindows: IncidentDetailsWindows[decadeKey],
    getPaddingSizeForArtifact: getPaddingSizeForArtifact,
    artifactWidth: StandardArtifactWidth,
    decadeConfig: DecadeConfigurations[decadeKey] || DecadeConfigurations[1990],
  };

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
};
