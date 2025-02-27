"use client";

import { useIncidents } from "@/app/contexts/IncidentContext";
import { useTheme } from "@/app/contexts/ThemeContext";
import GalleryNavButtons from "../../ui/gallery-navigation/GalleryNavButtons";
import { useMemo, useState, useEffect, useRef } from "react";

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

  const [isAnimating, setIsAnimating] = useState(false);
  const previousIndexRef = useRef(currentIncidentIndex);
  const sliderTrackRef = useRef(null);

  // Extract all years where incidents occurred and sort them
  const incidentYears = useMemo(() => {
    return [
      ...new Set(
        incidents
          .map((incident) => {
            try {
              return new Date(incident.incident_date).getFullYear();
            } catch (e) {
              console.error("Error parsing date:", incident.incident_date);
              return null;
            }
          })
          .filter((year) => year !== null)
      ),
    ].sort((a, b) => a - b);
  }, [incidents]);

  // Get the year of the currently displayed incident
  const currentIncidentYear = useMemo(() => {
    if (!displayedIncident?.incident_date) return null;
    try {
      return new Date(displayedIncident.incident_date).getFullYear();
    } catch (e) {
      console.error(
        "Error parsing current incident date:",
        displayedIncident.incident_date
      );
      return null;
    }
  }, [displayedIncident]);

  // Handle animation when current incident changes
  useEffect(() => {
    if (
      previousIndexRef.current !== currentIncidentIndex &&
      incidents?.length > 0
    ) {
      setIsAnimating(true);

      // Clear the animation after it completes
      const timer = setTimeout(() => {
        setIsAnimating(false);
      }, 350);

      previousIndexRef.current = currentIncidentIndex;

      return () => clearTimeout(timer);
    }
  }, [currentIncidentIndex, incidents]);

  const goToNext = () => {
    if (isAnimating) return; // Prevent rapid clicking
    const nextIndex = (currentIncidentIndex + 1) % incidents.length;
    handleIncidentNavigation(nextIndex);
  };

  const goToPrevious = () => {
    if (isAnimating) return; // Prevent rapid clicking
    const prevIndex =
      currentIncidentIndex === 0
        ? incidents.length - 1
        : currentIncidentIndex - 1;
    handleIncidentNavigation(prevIndex);
  };

  const handleYearClick = (year) => {
    if (isAnimating) return; // Prevent clicking during animation

    // Find the first incident from the selected year
    const targetIncidentIndex = incidents.findIndex((incident) => {
      try {
        const incidentYear = new Date(incident.incident_date).getFullYear();
        return incidentYear === year;
      } catch (e) {
        return false;
      }
    });

    // If found, navigate to it
    if (targetIncidentIndex >= 0) {
      handleIncidentNavigation(targetIncidentIndex);
    }
  };

  if (!displayedIncident) return null;

  return (
    <div className={`gallery-container ${theme.background} incident-content`}>
      <div
        className="incident-slider-container"
        style={{
          position: "relative",
          width: "100%",
          height: "100%",
          overflow: "hidden",
          flexGrow: 1,
        }}
      >
        <div
          ref={sliderTrackRef}
          className="incident-slider-track"
          style={{
            display: "flex",
            width: "100%",
            height: "100%",
            transform: `translateX(-${currentIncidentIndex * 100}%)`,
            transition: "transform 0.30s ease-in-out",
            willChange: "transform",
          }}
        >
          {incidents.map((incident, index) => (
            <div
              key={incident.id}
              className="incident-slide"
              style={{
                flex: "0 0 100%",
                width: "100%",
                height: "100%",
                position: "relative",
              }}
            >
              <GalleryDisplay
                incident={incident}
                incidents={incidents}
                onClose={() => setDisplayedIncident(null)}
                currentIndex={index}
                onNavigate={handleIncidentNavigation}
                decade={currentDecade}
                theme={theme}
              />
            </div>
          ))}
        </div>
      </div>

      <GalleryNavButtons
        onPreviousClick={goToPrevious}
        onNextClick={goToNext}
        currentDecade={currentDecade}
        decades={[
          ...new Set(incidentYears.map((year) => Math.floor(year / 10) * 10)),
        ]}
        incidentYears={incidentYears}
        onClose={() => setDisplayedIncident(null)}
        currentIncidentYear={currentIncidentYear}
        onYearClick={handleYearClick}
      />
    </div>
  );
};

export default IncidentGallery;
