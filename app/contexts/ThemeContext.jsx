"use client";

import React, { createContext, useContext, useMemo } from "react";
import { useIncidents } from "./IncidentContext";

import DetailsWindow1980s from "@/app/components/ui/detail-windows/DetailsWindow1980s";
import DetailsWindow2000s from "@/app/components/ui/detail-windows/DetailsWindow2000s";
import DetailsWindow2010s from "@/app/components/ui/detail-windows/DetailsWindow2010s";
import DetailsWindow2020s from "@/app/components/ui/detail-windows/DetailsWindow2020s";
import DetailsWindow1990s from "@/app/components/ui/detail-windows/DetailsWindow1990s";

/**
 * Mapping of decade to corresponding detail window component
 * @type {Object.<number, React.ComponentType>}
 */
const IncidentDetailsWindows = {
  1980: DetailsWindow1980s,
  1990: DetailsWindow1990s,
  2000: DetailsWindow2000s,
  2010: DetailsWindow2010s,
  2020: DetailsWindow2020s,
};

/**
 * Default context value using 1990s theme
 * @type {Object}
 */
const defaultContextValue = {
  decade: 1990,
  IncidentDetailsWindows: IncidentDetailsWindows[1990],
};

/**
 * Context for decade-specific UI themes
 * @type {React.Context}
 */
const ThemeContext = createContext(defaultContextValue);

/**
 * Custom hook to use the theme context
 *
 * @returns {Object} Theme context value with decade and detail component
 */
export const useTheme = () => useContext(ThemeContext);

/**
 * Provider component for decade-specific UI themes
 *
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Child components
 * @returns {JSX.Element} Theme provider component
 */
export const ThemeProvider = ({ children }) => {
  const { currentDecade } = useIncidents();

  /**
   * Determines the appropriate theme based on the current decade
   */
  const value = useMemo(() => {
    const decadeKey = getValidDecadeKey(currentDecade);

    return {
      decade: decadeKey,
      IncidentDetailsWindows: IncidentDetailsWindows[decadeKey],
    };
  }, [currentDecade]);

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
};

/**
 * Gets a valid decade key for theme selection
 *
 * @param {number|null} decade - Current decade
 * @returns {number} Valid decade key (defaults to 2020 if invalid)
 */
const getValidDecadeKey = (decade) => {
  return Object.keys(IncidentDetailsWindows).includes(String(decade))
    ? decade
    : 2020;
};
