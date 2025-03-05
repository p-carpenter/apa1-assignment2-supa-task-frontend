"use client";

import { useIncidents } from "@/app/contexts/IncidentContext";
import { useTheme } from "@/app/contexts/ThemeContext";
import GalleryNavButtons from "@/app/components/ui/gallery-navigation/GalleryNavButtons";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import {
  findIncidentBySlug,
  generateSlug,
} from "@/app/utils/navigation/slugUtils";

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

  const [currentIncident, setCurrentIncident] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const hasIncidents = useMemo(
    () => Array.isArray(incidents) && incidents.length > 0,
    [incidents]
  );

  const availableIncidents = useMemo(() => {
    if (!hasIncidents) return [];
    return (activeFilter || searchQuery) && filteredIncidents.length
      ? filteredIncidents
      : incidents;
  }, [incidents, filteredIncidents, activeFilter, searchQuery, hasIncidents]);

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

  const currentIncidentYear = useMemo(() => {
    try {
      return currentIncident?.incident_date
        ? new Date(currentIncident.incident_date).getFullYear()
        : null;
    } catch (e) {
      return null;
    }
  }, [currentIncident]);

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

  const currentIndex = useMemo(() => {
    if (!currentIncident || !hasIncidents) return -1;
    return incidents.findIndex((inc) => inc.id === currentIncident.id);
  }, [currentIncident, incidents, hasIncidents]);

  useEffect(() => {
    if (!hasIncidents) return;

    if (!slug) {
      const targetIncident = displayedIncident || incidents[0];
      if (targetIncident) {
        const newSlug = generateSlug(targetIncident.name);
        const url = `/gallery?incident=${newSlug}`;
        window.history.replaceState({ path: url }, "", url);

        setCurrentIncident(targetIncident);
        setIsLoading(false);
        return;
      }
    } else {
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

    if (hasIncidents) {
      const firstIncident = incidents[0];
      const firstSlug = generateSlug(firstIncident.name);
      const url = `/gallery?incident=${firstSlug}`;
      window.history.replaceState({ path: url }, "", url);

      setCurrentIncident(firstIncident);
      setDisplayedIncident(firstIncident);
      setIsLoading(false);
    } else {
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

  const handleYearClick = (year) => {
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
