import React, { createContext, useContext } from 'react';

const ThemeContext = createContext({
  decade: 1990,
  theme: {
    name: "Windows 95",
    background: "bg-[#008080]",
    text: "text-black",
    fontFamily: "font-WFA95",
    accent: "bg-win95gray",
  },
  GalleryDisplay: ({ incident }) => (
    <div data-testid="mock-gallery-display">
      {incident?.name || 'No incident'}
    </div>
  ),
});

export const useTheme = () => useContext(ThemeContext);

export const ThemeProvider = ({ children }) => {
  return (
    <ThemeContext.Provider value={{
      decade: 1990,
      theme: {
        name: "Windows 95",
        background: "bg-[#008080]",
        text: "text-black",
        fontFamily: "font-WFA95",
        accent: "bg-win95gray",
      },
      GalleryDisplay: ({ incident }) => (
        <div data-testid="mock-gallery-display">
          {incident?.name || 'No incident'}
        </div>
      )
    }}>
      {children}
    </ThemeContext.Provider>
  );
};
