"use client";

import { useIncidents } from "@/app/contexts/IncidentContext";
import { useTheme } from "@/app/contexts/ThemeContext";
import GalleryNavButtons from "../../ui/gallery-navigation/GalleryNavButtons";

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

  const goToNext = () => {
    const nextIndex = (currentIncidentIndex + 1) % incidents.length;
    handleIncidentNavigation(nextIndex);
  };

  const goToPrevious = () => {
    const prevIndex =
      currentIncidentIndex === 0
        ? incidents.length - 1
        : currentIncidentIndex - 1;
    handleIncidentNavigation(prevIndex);
  };

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

      <GalleryNavButtons
        onPreviousClick={goToPrevious}
        onNextClick={goToNext}
      />
    </div>
  );
};

export default IncidentGallery;
