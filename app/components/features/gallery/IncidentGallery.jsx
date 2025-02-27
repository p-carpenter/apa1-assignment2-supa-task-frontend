"use client";

import { useIncidents } from "@/app/contexts/IncidentContext";
import { useTheme } from "@/app/contexts/ThemeContext";

const IncidentGallery = () => {
  const { GalleryDisplay, theme } = useTheme();
  const {
    displayedIncident,
    setDisplayedIncident,
    incidents,
    currentIncidentIndex,
    handleIncidentNavigation,
    currentDecade,
    slideDirection,
  } = useIncidents();

  if (!displayedIncident) return null;

  return (
    <div
      className={`gallery-container ${theme.background} incident-content ${slideDirection ? `slide-${slideDirection}` : ""}`}
    >
      <GalleryDisplay
        incident={displayedIncident}
        incidents={incidents}
        onClose={() => setDisplayedIncident(null)}
        currentIndex={currentIncidentIndex}
        onNavigate={handleIncidentNavigation}
        decade={currentDecade}
        theme={theme}
      />
    </div>
  );
};

export default IncidentGallery;
