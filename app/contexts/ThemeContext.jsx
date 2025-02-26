"use client";

import React, { createContext, useContext } from "react";
import { useIncidents } from "./IncidentContext";

// import * as Era80s from "@/app/components/era-ui/1980s";
import * as Era90s from "../components/era-ui/1990s";
// import * as Era00s from "./era-ui/2000s";
// import * as Era10s from "./era-ui/2010s";
// import * as Era20s from "./era-ui/2020s";

const EraComponents = {
  //   1980: Era80s,
  1990: Era90s,
  //   2000: Era00s,
  //   2010: Era10s,
  //   2020: Era20s,
};

const DecadeThemes = {
  1980: {
    background: "bg-black",
    text: "text-[#00ff00]",
    fontFamily: "font-mono",
    accent: "text-[#00ff00]",
    effects: {
      hasScanLines: true,
      hasBlinkingCursor: true,
    },
  },
  1990: {
    background: "bg-[#008080]", // Teal background
    text: "text-white",
    fontFamily: "font-WFA95",
    accent: "text-yellow-400",
    effects: {
      hasScanLines: false,
      hasBlinkingCursor: false,
    },
  },
};

const ThemeContext = createContext({
  decade: 1990,
  theme: DecadeThemes[1990],
  components: EraComponents[1990],
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
    components: EraComponents[decadeKey],
  };

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
};
