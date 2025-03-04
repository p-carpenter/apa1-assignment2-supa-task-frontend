"use client";

import { useIncidents } from "@/app/contexts/IncidentContext";
import { useTheme } from "@/app/contexts/ThemeContext";
import GalleryNavButtons from "@/app/components/ui/gallery-navigation/GalleryNavButtons";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { findIncidentBySlug, generateSlug } from "@/app/utils/slugUtils";

export default function GalleryPage() {
  const { GalleryDisplay, theme } = useTheme();
  const {
    incidents,
    filteredIncidents,
    setDisplayedIncident,
    setCurrentIncidentIndex,
    currentDecade,
    setCurrentDecade,
    activeFilter,
    searchQuery,
    displayedIncident,
  } = useIncidents();

  const router = useRouter();
  const searchParams = useSearchParams();
  const slug = searchParams.get("incident");

  // Local state
  const [currentIncident, setCurrentIncident] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Safety check for incidents
  const hasIncidents = useMemo(
    () => Array.isArray(incidents) && incidents.length > 0,
    [incidents]
  );

  // Determine which incidents to show based on filters
  const availableIncidents = useMemo(() => {
    if (!hasIncidents) return [];
    return (activeFilter || searchQuery) && filteredIncidents.length
      ? filteredIncidents
      : incidents;
  }, [incidents, filteredIncidents, activeFilter, searchQuery, hasIncidents]);

  // Extract years from available incidents for the timeline
  const incidentYears = useMemo(() => {
    return [
      ...new Set(
        availableIncidents
          .map((incident) => {
            try {
              return new Date(incident.incident_date).getFullYear();
            } catch (e) {
              return null;
            }
          })
          .filter(Boolean)
          .sort((a, b) => a - b)
      ),
    ];
  }, [availableIncidents]);

  // Get current incident year and decade
  const currentIncidentYear = useMemo(() => {
    try {
      return currentIncident?.incident_date
        ? new Date(currentIncident.incident_date).getFullYear()
        : null;
    } catch (e) {
      return null;
    }
  }, [currentIncident]);

  // Update the decade whenever the current incident changes
  useEffect(() => {
    if (currentIncident?.incident_date) {
      try {
        const year = new Date(currentIncident.incident_date).getFullYear();
        const decade = Math.floor(year / 10) * 10;
        setCurrentDecade(decade);
      } catch (error) {
        console.error("Error extracting decade from incident:", error);
      }
    }
  }, [currentIncident, setCurrentDecade]);

  // Get current incident index for navigation
  const currentIndex = useMemo(() => {
    if (!currentIncident || !hasIncidents) return -1;
    return incidents.findIndex((inc) => inc.id === currentIncident.id);
  }, [currentIncident, incidents, hasIncidents]);

  // Load the incident based on query param or displayed incident
  useEffect(() => {
    if (!hasIncidents) return;

    // If no slug, use displayedIncident or first incident
    if (!slug) {
      const targetIncident = displayedIncident || incidents[0];
      if (targetIncident) {
        // Update URL with the slug (without causing navigation)
        const newSlug = generateSlug(targetIncident.name);
        const url = `/gallery?incident=${newSlug}`;
        window.history.replaceState({ path: url }, "", url);

        // Set as current incident
        setCurrentIncident(targetIncident);
        setIsLoading(false);
        return;
      }
    } else {
      // Find by slug
      const incident = findIncidentBySlug(incidents, slug);

      if (incident) {
        const index = incidents.findIndex((inc) => inc.id === incident.id);
        setCurrentIncidentIndex(index);
        setDisplayedIncident(incident);
        setCurrentIncident(incident);
        setIsLoading(false);
        return;
      }
    }

    // If we reach here, try using first incident as fallback
    if (hasIncidents) {
      const firstIncident = incidents[0];
      const firstSlug = generateSlug(firstIncident.name);
      const url = `/gallery?incident=${firstSlug}`;
      window.history.replaceState({ path: url }, "", url);

      setCurrentIncident(firstIncident);
      setDisplayedIncident(firstIncident);
      setIsLoading(false);
    } else {
      // No incidents available
      setIsLoading(false);
    }
  }, [
    slug,
    incidents,
    displayedIncident,
    hasIncidents,
    setCurrentIncidentIndex,
    setDisplayedIncident,
  ]);

  // Handle next/previous navigation
  const handleNavigation = (direction) => {
    if (currentIndex === -1 || !hasIncidents) return;

    const newIndex =
      direction === "next"
        ? (currentIndex + 1) % incidents.length
        : (currentIndex - 1 + incidents.length) % incidents.length;

    const nextIncident = incidents[newIndex];
    const nextSlug = generateSlug(nextIncident.name);

    // Update URL and state
    const url = `/gallery?incident=${nextSlug}`;
    window.history.pushState({ path: url }, "", url);

    setCurrentIncidentIndex(newIndex);
    setDisplayedIncident(nextIncident);
    setCurrentIncident(nextIncident);
  };

  // Handle year click in timeline
  const handleYearClick = (year) => {
    // Find first incident from that year
    const yearIncident = availableIncidents.find((incident) => {
      try {
        return new Date(incident.incident_date).getFullYear() === year;
      } catch (e) {
        return false;
      }
    });

    if (yearIncident) {
      const yearSlug = generateSlug(yearIncident.name);
      const url = `/gallery?incident=${yearSlug}`;
      window.history.pushState({ path: url }, "", url);

      setCurrentIncident(yearIncident);
      setDisplayedIncident(yearIncident);
    }
  };

  // Show error if no incidents found
  if (!currentIncident) {
    return (
      <div className="error-container">
        <p>No incidents available to display.</p>
        <button
          onClick={() => router.push("/catalog?reset=true")}
          className="catalog-button"
        >
          Return to Catalog
        </button>
      </div>
    );
  }

  return (
    <div className={`gallery-container ${theme.background} incident-content`}>
      <div className="incident-detail-container" style={{ flexGrow: 1 }}>
        <GalleryDisplay
          incident={currentIncident}
          incidents={availableIncidents}
          onClose={() => router.push("/catalog?reset=true")}
          currentIndex={currentIndex}
          onNavigate={(index) => {
            const nextIncident = incidents[index];
            const nextSlug = generateSlug(nextIncident.name);
            const url = `/gallery?incident=${nextSlug}`;
            window.history.pushState({ path: url }, "", url);

            setCurrentIncident(nextIncident);
            setCurrentIncidentIndex(index);
            setDisplayedIncident(nextIncident);
          }}
          decade={currentDecade}
          theme={theme}
        />
      </div>

      <GalleryNavButtons
        onPreviousClick={() => handleNavigation("prev")}
        onNextClick={() => handleNavigation("next")}
        currentDecade={currentDecade}
        incidentYears={incidentYears}
        currentIncidentYear={currentIncidentYear}
        onYearClick={handleYearClick}
        onClose={() => {
          router.push("/catalog?reset=true");
        }}
        activeFilter={activeFilter}
        hasFilters={Boolean(activeFilter || searchQuery)}
      />
    </div>
  );
}
