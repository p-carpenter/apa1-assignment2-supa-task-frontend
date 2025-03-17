"use client";

import { useIncidents } from "@/app/contexts/IncidentContext";
import { useTheme } from "@/app/contexts/ThemeContext";
import GalleryNavButtons from "@/app/components/ui/gallery-navigation/GalleryNavButtons";
import GalleryDisplay from "@/app/gallery/GalleryDisplay";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import {
  findIncidentBySlug,
  generateSlug,
} from "@/app/utils/navigation/slugUtils";

const GalleryPageContent = () => {
  const { theme } = useTheme();
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
    isLoading: incidentsLoading,
  } = useIncidents();

  const router = useRouter();
  const searchParams = useSearchParams();
  const slug = searchParams.get("incident");

  const [currentIncident, setCurrentIncident] = useState(null);
  const [incidentCountByYear, setIncidentCountByYear] = useState({});
  const [currentIncidentIndexByYear, setCurrentIncidentIndexByYear] = useState(
    {}
  );

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

  const incidentsByYear = useMemo(() => {
    if (!availableIncidents.length) return {};

    const grouped = {};
    const counts = {};

    availableIncidents.forEach((incident) => {
      try {
        if (incident.incident_date) {
          const year = new Date(incident.incident_date).getFullYear();
          if (!grouped[year]) {
            grouped[year] = [];
            counts[year] = 0;
          }
          grouped[year].push(incident);
          counts[year]++;
        }
      } catch (e) {
        console.error("Error processing incident:", e);
      }
    });

    setIncidentCountByYear(counts);
    return grouped;
  }, [availableIncidents]);

  const incidentYears = useMemo(() => {
    return Object.keys(incidentsByYear)
      .map(Number)
      .sort((a, b) => a - b);
  }, [incidentsByYear]);

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
    if (!currentIncident || !currentIncidentYear) return;

    const year = currentIncidentYear;
    const incidents = incidentsByYear[year] || [];

    if (incidents.length > 0) {
      const index = incidents.findIndex((inc) => inc.id === currentIncident.id);
      if (index !== -1) {
        setCurrentIncidentIndexByYear((prev) => ({
          ...prev,
          [year]: index,
        }));
      }
    }
  }, [currentIncident, incidentsByYear, currentIncidentYear]);

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
    if (incidentsLoading || !hasIncidents) return;

    if (!slug) {
      const targetIncident = displayedIncident || incidents[0];
      if (targetIncident) {
        const newSlug = generateSlug(targetIncident.name);
        const url = `/gallery?incident=${newSlug}`;
        window.history.replaceState({ path: url }, "", url);

        setCurrentIncident(targetIncident);
        return;
      }
    } else {
      const incident = findIncidentBySlug(incidents, slug);

      if (incident) {
        const index = incidents.findIndex((inc) => inc.id === incident.id);
        setCurrentIncidentIndex(index);
        setDisplayedIncident(incident);
        setCurrentIncident(incident);
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
    }
  }, [
    slug,
    incidents,
    displayedIncident,
    hasIncidents,
    setCurrentIncidentIndex,
    setDisplayedIncident,
    incidentsLoading,
  ]);

  const handleNavigation = (direction) => {
    if (!hasIncidents || !currentIncident) return;

    const year = currentIncidentYear;
    if (!year) {
      navigateWithoutYearContext(direction);
      return;
    }

    const incidentsInYear = incidentsByYear[year] || [];
    const currentYearIndex = currentIncidentIndexByYear[year] || 0;

    if (
      incidentsInYear.length <= 1 ||
      (direction === "next" &&
        currentYearIndex >= incidentsInYear.length - 1) ||
      (direction === "prev" && currentYearIndex === 0)
    ) {
      const yearIndex = incidentYears.indexOf(year);
      if (yearIndex === -1) {
        navigateWithoutYearContext(direction);
        return;
      }

      const nextYearIndex =
        direction === "next"
          ? (yearIndex + 1) % incidentYears.length
          : (yearIndex - 1 + incidentYears.length) % incidentYears.length;

      const targetYear = incidentYears[nextYearIndex];
      const incidentsInTargetYear = incidentsByYear[targetYear] || [];

      if (incidentsInTargetYear.length === 0) {
        navigateWithoutYearContext(direction);
        return;
      }

      const targetIndexInYear =
        direction === "next" ? 0 : incidentsInTargetYear.length - 1;
      const targetIncident = incidentsInTargetYear[targetIndexInYear];

      navigateToIncident(targetIncident, targetYear, targetIndexInYear);
    } else {
      const nextIndexInYear =
        direction === "next"
          ? (currentYearIndex + 1) % incidentsInYear.length
          : (currentYearIndex - 1 + incidentsInYear.length) %
            incidentsInYear.length;

      const targetIncident = incidentsInYear[nextIndexInYear];
      navigateToIncident(targetIncident, year, nextIndexInYear);
    }
  };

  const navigateWithoutYearContext = (direction) => {
    const newIndex =
      direction === "next"
        ? (currentIndex + 1) % incidents.length
        : (currentIndex - 1 + incidents.length) % incidents.length;

    const nextIncident = incidents[newIndex];
    navigateToIncident(nextIncident);
  };

  const navigateToIncident = (incident, year = null, indexInYear = null) => {
    if (!incident) return;

    const slug = generateSlug(incident.name);
    const url = `/gallery?incident=${slug}`;
    window.history.pushState({ path: url }, "", url);

    const globalIndex = incidents.findIndex((inc) => inc.id === incident.id);
    if (globalIndex !== -1) {
      setCurrentIncidentIndex(globalIndex);
    }

    setDisplayedIncident(incident);
    setCurrentIncident(incident);

    if (year !== null && indexInYear !== null) {
      setCurrentIncidentIndexByYear((prev) => ({
        ...prev,
        [year]: indexInYear,
      }));
    }
  };

  const handleYearClick = (year, indexInYear = 0) => {
    if (!incidentsByYear[year] || incidentsByYear[year].length === 0) {
      console.log(`No incidents for year ${year}`);
      return;
    }

    const yearIncidents = incidentsByYear[year];

    const safeIndex = indexInYear % yearIncidents.length;

    const selectedIncident = yearIncidents[safeIndex];

    if (selectedIncident) {
      const yearSlug = generateSlug(selectedIncident.name);
      const url = `/gallery?incident=${yearSlug}`;
      window.history.pushState({ path: url }, "", url);

      setCurrentIncident(selectedIncident);
      setDisplayedIncident(selectedIncident);

      const globalIndex = incidents.findIndex(
        (inc) => inc.id === selectedIncident.id
      );
      if (globalIndex !== -1) {
        setCurrentIncidentIndex(globalIndex);
      }
    }
  };

  const currentYearIndex = currentIncidentYear
    ? currentIncidentIndexByYear[currentIncidentYear] || 0
    : 0;

  const placeholderIncident = useMemo(() => {
    return {
      name: "Loading...",
      description: "Loading incident details...",
      category: "Loading",
      severity: "Medium",
      incident_date: new Date().toISOString(),
    };
  }, []);

  return (
    <div className={`gallery-container incident-content`}>
      <GalleryNavButtons
        onPreviousClick={() => handleNavigation("prev")}
        onNextClick={() => handleNavigation("next")}
        incidentYears={incidentYears}
        currentIncidentYear={currentIncidentYear}
        onYearClick={handleYearClick}
        incidentCounts={incidentCountByYear}
        currentIncidentIndexInYear={currentYearIndex}
      />

      <div className="incident-detail-container" style={{ flexGrow: 1 }}>
        <GalleryDisplay
          incident={currentIncident || placeholderIncident}
          incidents={availableIncidents}
          isLoading={incidentsLoading || !currentIncident}
          onClose={() => router.push("/catalog?reset=true")}
          currentIndex={currentIndex}
          onNavigate={(index) => {
            if (!incidents[index]) return;
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
    </div>
  );
};

export default GalleryPageContent;
