"use client";

import { useIncidents } from "../contexts/IncidentContext";
import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { generateSlug } from "../utils/slugUtils";
import "./catalog.styles.css";

// Category icons mapping
const categoryIcons = {
  Hardware: "🔧", // wrench
  Software: "💻", // laptop
  Network: "🌐", // globe
  Security: "🔒", // lock
  Infrastructure: "🏗️", // building construction
  Database: "💾", // floppy disk
  "UI/UX": "👁️", // eye
  System: "⚙️", // gear
  Game: "🎮", // game controller
  Default: "📁", // folder
};

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

  // Get category icon
  const getCategoryIcon = (category) => {
    if (!category) return categoryIcons.Default;
    return categoryIcons[category] || categoryIcons.Default;
  };

  // Truncate text for teasers
  const truncateText = (text, maxLength = 80) => {
    if (!text) return "";
    return text.length > maxLength
      ? text.substring(0, maxLength) + "..."
      : text;
  };

  return (
    <>
      <div className="circuit-background"></div>

      <div className="archive-container catalog-container">
        <div className="console-window">
          <div className="terminal-header">
            <span className="terminal-dot"></span>
            <span className="terminal-dot"></span>
            <span className="terminal-dot"></span>
            <div className="terminal-title">tech-incidents-catalog</div>
            <div className="auth-controls">
              <button className="auth-button login">Log In</button>
              <button className="auth-button signup">Sign Up</button>
            </div>
          </div>

          <div className="console-content">
            <div className="console-section">
              <div className="command-line">
                <span className="prompt">user@archive:~$</span>
                <span className="command">
                  query tech_incidents.db --search=&quot;*&quot; --list
                </span>
              </div>

              <h1 className="archive-title">
                <span className="title-glitch" data-text="INCIDENT CATALOG">
                  INCIDENT CATALOG
                </span>
                <span className="cursor"></span>
              </h1>
              <h2 className="archive-subtitle">
                All documented technical mishaps since{" "}
                {yearsAvailable[0] || "1985"}
              </h2>

              <div className="command-output">
                <div className="loading-bar">
                  <div className="loading-progress"></div>
                </div>
                <div className="output-text">
                  Found {filteredIncidents.length} incidents in database.
                </div>
              </div>
            </div>

            {/* Timeline visualization */}
            {timelineMarkers.length > 0 && (
              <div className="timeline">
                {timelineMarkers.map((marker, index) => (
                  <div
                    key={index}
                    className={`timeline-marker ${marker.major ? "major" : ""}`}
                    style={{ left: marker.position }}
                    data-year={marker.year}
                  />
                ))}
              </div>
            )}

            <div className="console-section catalog-filters">
              <div className="command-line">
                <span className="prompt">user@archive:~$</span>
                <span className="command">set_filters --advanced</span>
              </div>

              {/* Enhanced search */}
              <div className="search-container">
                <input
                  type="text"
                  placeholder="Search by name, description, category, or year..."
                  value={realTimeSearch}
                  onChange={(e) => setRealTimeSearch(e.target.value)}
                  className="search-input"
                />
              </div>

              {/* Filter controls */}
              <div className="filter-section">
                <div className="filter-header">
                  <div className="filter-title">Filter by Year</div>
                </div>
                <div className="filter-tabs">
                  <div
                    key="all-years"
                    className={`filter-tab ${activeYear === "all" ? "active" : ""}`}
                    onClick={() => setActiveYear("all")}
                  >
                    ALL YEARS
                  </div>
                  {yearsAvailable.map((year) => (
                    <div
                      key={`year-${year}`}
                      className={`filter-tab ${activeYear === year ? "active" : ""}`}
                      onClick={() => setActiveYear(year)}
                    >
                      {year}
                    </div>
                  ))}
                </div>
              </div>

              {/* Category filters */}
              <div className="filter-section">
                <div className="filter-header">
                  <div className="filter-title">Filter by Category</div>
                </div>
                <div className="category-filters">
                  <div
                    className={`category-filter ${activeCategory === "all" ? "active" : ""}`}
                    onClick={() => setActiveCategory("all")}
                  >
                    {categoryIcons.Default} All
                  </div>
                  {categories.map((category) => (
                    <div
                      key={`cat-${category}`}
                      className={`category-filter ${activeCategory === category ? "active" : ""}`}
                      onClick={() => setActiveCategory(category)}
                    >
                      {getCategoryIcon(category)} {category}
                    </div>
                  ))}
                </div>
              </div>

              {/* Sort controls */}
              <div className="filter-section">
                <div className="filter-header">
                  <div className="filter-title">Sort by</div>
                </div>
                <div className="sort-controls">
                  <select
                    className="sort-select"
                    value={sortOrder}
                    onChange={(e) => setSortOrder(e.target.value)}
                  >
                    <option value="year-desc">Year (Newest first)</option>
                    <option value="year-asc">Year (Oldest first)</option>
                    <option value="name-asc">Name (A-Z)</option>
                    <option value="name-desc">Name (Z-A)</option>
                    <option value="severity-desc">Severity (High-Low)</option>
                    <option value="severity-asc">Severity (Low-High)</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="console-section">
              <div className="command-line">
                <span className="prompt">user@archive:~$</span>
                <span className="command">display_results --format=grid</span>
              </div>

              <div className="command-output">
                <div className="output-text">
                  Displaying {sortedIncidents.length} incidents
                </div>
              </div>

              {isLoading ? (
                <div className="incident-grid">
                  {[...Array(6)].map((_, i) => (
                    <div key={i} className="loading-card"></div>
                  ))}
                </div>
              ) : sortedIncidents.length > 0 ? (
                <div className="incident-grid">
                  {sortedIncidents.map((incident) => {
                    const year = getIncidentYear(incident);
                    const isHighSeverity = (incident.severity || 0) >= 4;

                    return (
                      <Link
                        key={
                          incident.id ||
                          `incident-${incident.name || "unknown"}`
                        }
                        href={`/gallery?incident=${generateSlug(incident.name || "Unknown Incident")}`}
                        onClick={() => {
                          const index = incidents.findIndex(
                            (inc) => inc.id === incident.id
                          );
                          setCurrentIncidentIndex(index >= 0 ? index : 0);
                          setDisplayedIncident(incident);
                        }}
                        className={`incident-item`}
                      >
                        <div className="incident-year">
                          {year || "Unknown Year"}
                        </div>
                        <div className="incident-name">
                          {incident.name || "Unknown Incident"}
                        </div>
                        <div className="incident-category">
                          {getCategoryIcon(incident.category)}{" "}
                          {incident.category || "Uncategorized"}
                        </div>
                        {incident.description && (
                          <div className="incident-teaser">
                            {truncateText(incident.description)}
                          </div>
                        )}
                        <div className="view-details">View Details</div>
                      </Link>
                    );
                  })}
                </div>
              ) : (
                <div className="empty-results">
                  <div className="output-text blink-once">
                    Error: No matching incidents found.
                  </div>
                  <div className="output-text">
                    Try adjusting search parameters or filters.
                  </div>
                </div>
              )}
            </div>

            {/* <div className="console-section action-section">
              <div className="command-line">
                <span className="prompt">user@archive:~$</span>
                <span className="command">cd ../home</span>
              </div>
              <Link href="/" className="console-button secondary">
                <span className="entry-icon reversed">&#x2190;</span>
                <span className="button-text">RETURN TO ARCHIVE</span>
              </Link>
            </div> */}
          </div>

          <div className="console-footer">
            <div className="status-item">TECH INCIDENTS DATABASE</div>
            <div className="status-item">CATALOG VIEW</div>
            <div className="status-item blink-slow">
              {filteredIncidents.length} RECORDS RETRIEVED
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ArchiveCatalog;
