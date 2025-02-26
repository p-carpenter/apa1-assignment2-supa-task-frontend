"use client";

import { useIncidents } from "../../contexts/IncidentContext";
import { useTheme } from "../../contexts/ThemeContext";
import ThemedIncidentViewer from "../gallery/ThemedIncidentViewer";

const IncidentGallery = () => {
  const { theme } = useTheme();
  const {
    displayedIncident,
    setDisplayedIncident,
    incidents,
    currentIncidentIndex,
    handleIncidentNavigation,
    currentDecade,
  } = useIncidents();

  if (!displayedIncident) return null;

  return (
    <ThemedGalleryDisplay
      incident={displayedIncident}
      incidents={incidents}
      onClose={() => setDisplayedIncident(null)}
      currentIndex={currentIncidentIndex}
      onNavigate={handleIncidentNavigation}
      decade={currentDecade}
      theme={theme}
    />
  );
};

export default IncidentGallery;
