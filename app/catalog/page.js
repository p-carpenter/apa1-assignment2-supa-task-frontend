"use client";

import { useIncidents } from "../contexts/incidents";
import { useState, useEffect, useMemo } from "react";
import "./catalog.styles.css";

// Import reusable components using barrel files
import {
  ConsoleWindow,
  ConsoleSection,
  CommandOutput,
  CatalogHeader,
  Timeline
} from "../components/ui";

import {
  CatalogFilters,
  IncidentGrid
} from "../components/layouts";

const ArchiveCatalog = () => {
  // Get incident context data
  const { incidents, setDisplayedIncident, setCurrentIncidentIndex } =
    useIncidents();
  const [activeYear, setActiveYear] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [yearsAvailable, setYearsAvailable] = useState([]);
  const [activeCategory, setActiveCategory] = useState("all");
  const [sortOrder, setSortOrder] = useState("year-desc");
  const [isLoading, setIsLoading] = useState(true);
  const [realTimeSearch, setRealTimeSearch] = useState("");

  // Helper function to extract year from incident_date
  const getIncidentYear = (incident) => {
    if (!incident || !incident.incident_date) return null;
    try {
      return new Date(incident.incident_date).getFullYear();
    } catch (error) {
      console.error("Error extracting year:", error);
      return null;
    }
  };

  // Extract available years and categories from incidents
  useEffect(() => {
    if (!incidents || !incidents.length) return;
    setIsLoading(false);

    const years = incidents
      .map((incident) => getIncidentYear(incident))
      .filter((year) => year !== null)
      .map((year) => year.toString());

    const uniqueYears = [...new Set(years)].sort();
    setYearsAvailable(uniqueYears);
  }, [incidents]);

  // Extract unique categories
  const categories = useMemo(() => {
    if (!incidents || !incidents.length) return [];

    const cats = incidents
      .map((incident) => incident.category)
      .filter((category) => category)
      .reduce((acc, category) => {
        if (!acc.includes(category)) {
          acc.push(category);
        }
        return acc;
      }, []);

    return cats.sort();
  }, [incidents]);

  // Apply real-time search with debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearchQuery(realTimeSearch);
    }, 300);

    return () => clearTimeout(timer);
  }, [realTimeSearch]);

  // Filter incidents based on active year, category, and search query
  const filteredIncidents = useMemo(() => {
    if (!incidents || !incidents.length) return [];

    return incidents.filter((incident) => {
      if (!incident) return false;

      const year = getIncidentYear(incident);

      // Check year match
      const matchesYear =
        activeYear === "all" || (year && year.toString() === activeYear);

      // Check category match
      const matchesCategory =
        activeCategory === "all" ||
        (incident.category && incident.category === activeCategory);

      // Check search match
      const matchesSearch =
        searchQuery === "" ||
        (incident.name &&
          incident.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (incident.category &&
          incident.category
            .toLowerCase()
            .includes(searchQuery.toLowerCase())) ||
        (incident.description &&
          incident.description
            .toLowerCase()
            .includes(searchQuery.toLowerCase())) ||
        (year && year.toString().includes(searchQuery));

      return matchesYear && matchesCategory && matchesSearch;
    });
  }, [incidents, activeYear, activeCategory, searchQuery]);

  // Sort the filtered incidents
  const sortedIncidents = useMemo(() => {
    if (!filteredIncidents.length) return [];

    return [...filteredIncidents].sort((a, b) => {
      const yearA = getIncidentYear(a) || 0;
      const yearB = getIncidentYear(b) || 0;

      switch (sortOrder) {
        case "year-asc":
          return yearA - yearB;
        case "year-desc":
          return yearB - yearA;
        case "name-asc":
          return a.name.localeCompare(b.name);
        case "name-desc":
          return b.name.localeCompare(a.name);
        case "severity-asc":
          return (a.severity || 0) - (b.severity || 0);
        case "severity-desc":
          return (b.severity || 0) - (a.severity || 0);
        default:
          return yearB - yearA;
      }
    });
  }, [filteredIncidents, sortOrder]);

  // Generate timeline markers for significant incidents
  const timelineMarkers = useMemo(() => {
    if (!yearsAvailable.length) return [];

    // Get min and max years
    const minYear = Math.min(...yearsAvailable.map((y) => parseInt(y, 10)));
    const maxYear = Math.max(...yearsAvailable.map((y) => parseInt(y, 10)));
    const range = maxYear - minYear;

    // Get major incidents
    const majorIncidents = incidents.filter((inc) => inc.severity >= 4);

    // Create a marker for each major incident
    return majorIncidents
      .map((inc) => {
        const year = getIncidentYear(inc);
        if (!year) return null;

        const position = ((year - minYear) / range) * 100;
        return {
          year,
          position: `${position}%`,
          major: inc.severity >= 4,
        };
      })
      .filter(Boolean);
  }, [incidents, yearsAvailable]);

  // Define status items for the console footer
  const statusItems = [
    "TECH INCIDENTS DATABASE",
    "CATALOG VIEW",
    { text: `${filteredIncidents.length} RECORDS RETRIEVED`, blink: true }
  ];

  // Handle incident selection
  const handleIncidentSelect = (incident) => {
    const index = incidents.findIndex(inc => inc.id === incident.id);
    setCurrentIncidentIndex(index >= 0 ? index : 0);
    setDisplayedIncident(incident);
  };

  return (
    <>
      <div className="circuit-background"></div>

      <div className="archive-container catalog-container">
        <ConsoleWindow 
          title="tech-incidents-catalog"
          statusItems={statusItems}
        >
          <ConsoleSection command="query tech_incidents.db --search=&quot;*&quot; --list">
            <CatalogHeader 
              title="INCIDENT CATALOG" 
              subtitle={`All documented technical mishaps since ${yearsAvailable[0] || "1985"}`}
            />
            
            <CommandOutput showLoadingBar={true}>
              Found {filteredIncidents.length} incidents in database.
            </CommandOutput>
          </ConsoleSection>

          {/* Timeline visualization */}
          <Timeline markers={timelineMarkers} />

          {/* Filters Section */}
          <CatalogFilters 
            searchQuery={realTimeSearch}
            onSearchChange={setRealTimeSearch}
            activeYear={activeYear}
            yearsAvailable={yearsAvailable}
            onYearChange={setActiveYear}
            activeCategory={activeCategory}
            categories={categories}
            onCategoryChange={setActiveCategory}
            sortOrder={sortOrder}
            onSortChange={setSortOrder}
          />

          {/* Results Section */}
          <ConsoleSection command="display_results --format=grid">
            <CommandOutput>
              Displaying {sortedIncidents.length} incidents
            </CommandOutput>
            
            <IncidentGrid 
              incidents={sortedIncidents}
              isLoading={isLoading}
              emptyMessage="No matching incidents found."
              onIncidentSelect={handleIncidentSelect}
              getIncidentYear={getIncidentYear}
            />
          </ConsoleSection>
        </ConsoleWindow>
      </div>
    </>
  );
};

export default ArchiveCatalog;
