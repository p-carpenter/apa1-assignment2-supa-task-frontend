"use client";

import { useIncidents } from "../contexts/IncidentContext";
import { useState, useEffect, useMemo } from "react";
import "./catalog.styles.css";

import {
  ConsoleWindow,
  ConsoleSection,
  CommandOutput,
  CatalogHeader,
} from "../components/ui";

import { CatalogFilters, IncidentGrid } from "../components/layouts";

const Catalog = () => {
  const { incidents, setDisplayedIncident, setCurrentIncidentIndex } =
    useIncidents();
  const [activeYear, setActiveYear] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [yearsAvailable, setYearsAvailable] = useState([]);
  const [activeCategory, setActiveCategory] = useState("all");
  const [sortOrder, setSortOrder] = useState("year-desc");
  const [isLoading, setIsLoading] = useState(true);
  const [realTimeSearch, setRealTimeSearch] = useState("");

  const getIncidentYear = (incident) => {
    if (!incident || !incident.incident_date) return null;
    try {
      return new Date(incident.incident_date).getFullYear();
    } catch (error) {
      console.error("Error extracting year:", error);
      return null;
    }
  };

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

  useEffect(() => {
    const timer = setTimeout(() => {
      setSearchQuery(realTimeSearch);
    }, 300);

    return () => clearTimeout(timer);
  }, [realTimeSearch]);

  const filteredIncidents = useMemo(() => {
    if (!incidents || !incidents.length) return [];

    return incidents.filter((incident) => {
      if (!incident) return false;

      const year = getIncidentYear(incident);

      const matchesYear =
        activeYear === "all" || (year && year.toString() === activeYear);

      const matchesCategory =
        activeCategory === "all" ||
        (incident.category && incident.category === activeCategory);

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

  const statusItems = [
    "TECH INCIDENTS DATABASE",
    "CATALOG VIEW",
    { text: `${filteredIncidents.length} RECORDS RETRIEVED`, blink: true },
  ];

  const handleIncidentSelect = (incident) => {
    const index = incidents.findIndex((inc) => inc.id === incident.id);
    setCurrentIncidentIndex(index >= 0 ? index : 0);
    setDisplayedIncident(incident);
  };

  return (
    <>
      <div className="circuit-background"></div>

      <div className="archive-container catalog-container">
        <ConsoleWindow title="tech-incidents-catalog" statusItems={statusItems}>
          <ConsoleSection command='query tech_incidents.db --search="*" --list'>
            <CatalogHeader
              title="INCIDENT CATALOG"
              subtitle={`All documented technical mishaps since ${yearsAvailable[0] || "1985"}`}
            />

            <CommandOutput showLoadingBar={true}>
              Found {filteredIncidents.length} incidents in database.
            </CommandOutput>
          </ConsoleSection>

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

export default Catalog;
