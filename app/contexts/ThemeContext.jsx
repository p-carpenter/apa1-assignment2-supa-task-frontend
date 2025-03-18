"use client";

import React, { createContext, useContext, useMemo } from "react";
import { useIncidents } from "./IncidentContext";
import { getPaddingSizeForArtifact } from "@/app/utils/ui/artifactUtils";

import MacintoshDetailsWindow from "@/app/components/ui/detail-windows/MacintoshDetailsWindow";
import AeroDetailsWindow from "@/app/components/ui/detail-windows/AeroDetailsWindow";
import MaterialDetailsWindow from "@/app/components/ui/detail-windows/MaterialDetailsWindow";
import GlassmorphicDetailsWindow from "@/app/components/ui/detail-windows/GlassmorphicDetailsWindow";
import Win98DetailsWindow from "@/app/components/ui/detail-windows/Win98DetailsWindow";

const IncidentDetailsWindows = {
  1980: MacintoshDetailsWindow,
  1990: Win98DetailsWindow,
  2000: AeroDetailsWindow,
  2010: MaterialDetailsWindow,
  2020: GlassmorphicDetailsWindow,
};

const StandardArtifactWidth = 863;

const defaultContextValue = {
  decade: 1990,
  getPaddingSizeForArtifact: getPaddingSizeForArtifact,
  artifactWidth: StandardArtifactWidth,
  IncidentDetailsWindows: IncidentDetailsWindows[1990],
};

const ThemeContext = createContext(defaultContextValue);

export const useTheme = () => useContext(ThemeContext);

export const ThemeProvider = ({ children }) => {
  const { currentDecade } = useIncidents();

  const value = useMemo(() => {
    const decadeKey = Object.keys(IncidentDetailsWindows).includes(
      String(currentDecade)
    )
      ? currentDecade
      : 2020;

    return {
      decade: decadeKey,
      IncidentDetailsWindows: IncidentDetailsWindows[decadeKey],
      getPaddingSizeForArtifact: getPaddingSizeForArtifact,
      artifactWidth: StandardArtifactWidth,
    };
  }, [currentDecade]); // Only re-compute when currentDecade changes

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
};
