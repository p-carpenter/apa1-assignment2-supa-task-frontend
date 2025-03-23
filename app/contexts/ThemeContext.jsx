"use client";

import React, { createContext, useContext, useMemo } from "react";
import { useIncidents } from "./IncidentContext";

import DetailsWindow1980s from "@/app/components/ui/detail-windows/DetailsWindow1980s";
import DetailsWindow2000s from "@/app/components/ui/detail-windows/DetailsWindow2000s";
import DetailsWindow2010s from "@/app/components/ui/detail-windows/DetailsWindow2010s";
import DetailsWindow2020s from "@/app/components/ui/detail-windows/DetailsWindow2020s";
import DetailsWindow1990s from "@/app/components/ui/detail-windows/DetailsWindow1990s";

const IncidentDetailsWindows = {
  1980: DetailsWindow1980s,
  1990: DetailsWindow1990s,
  2000: DetailsWindow2000s,
  2010: DetailsWindow2010s,
  2020: DetailsWindow2020s,
};

const defaultContextValue = {
  decade: 1990,
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
    };
  }, [currentDecade]);

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
};
