"use client";

import React, { createContext, useContext } from "react";
import { useIncidents } from "./IncidentContext";
import DOSGalleryDisplay from "../components/features/gallery/80sGalleryDisplay";
import Win95GalleryDisplay from "../components/features/gallery/90sGalleryDisplay";

// Map of gallery display components by decade
const GalleryDisplays = {
  1980: DOSGalleryDisplay,
  1990: Win95GalleryDisplay,
  // Add more display components for other decades
};

// Basic theme properties still useful for global styling and smaller components
const DecadeThemes = {
  1980: {
    name: "DOS",
    background: "bg-[#0402ac]",
    text: "text-[#00ffff]",
    fontFamily: ["IBM VGA 9x16", "monospace"],
    accent: "text-[#00ffff]",
  },
  1990: {
    name: "Windows 95",
    background: "bg-[#008080]",
    text: "text-black",
    fontFamily: "font-WFA95",
    accent: "bg-win95gray",
  },
};

const ThemeContext = createContext({
  decade: 1990,
  theme: DecadeThemes[1990],
  GalleryDisplay: GalleryDisplays[1990],
});

export const useTheme = () => useContext(ThemeContext);

export const ThemeProvider = ({ children }) => {
  const { currentDecade } = useIncidents();

  const decadeKey = Object.keys(DecadeThemes).includes(String(currentDecade))
    ? currentDecade
    : 1990;

  const value = {
    decade: decadeKey,
    theme: DecadeThemes[decadeKey],
    GalleryDisplay: GalleryDisplays[decadeKey],
  };

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
};
