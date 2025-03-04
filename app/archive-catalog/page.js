"use client";

import { useIncidents } from "../contexts/IncidentContext";
import { useState, useEffect } from "react";
import Link from "next/link";
import { generateSlug } from "../utils/slugUtils";
import "./catalog.styles.css";

const ArchiveCatalog = () => {
  // Get incident context data
  const { incidents, setDisplayedIncident, setCurrentIncidentIndex } =
    useIncidents();
  const [activeYear, setActiveYear] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [yearsAvailable, setYearsAvailable] = useState([]);

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

  // Extract available years from incidents
  useEffect(() => {
    if (!incidents || !incidents.length) return;

    const years = incidents
      .map((incident) => getIncidentYear(incident))
      .filter((year) => year !== null)
      .map((year) => year.toString());

    const uniqueYears = [...new Set(years)].sort();
    setYearsAvailable(uniqueYears);
  }, [incidents]);

  // Filter incidents based on active year and search query
  const filteredIncidents = incidents.filter((incident) => {
    if (!incident) return false;

    const year = getIncidentYear(incident);

    // Check year match
    const matchesYear =
      activeYear === "all" || (year && year.toString() === activeYear);

    // Check search match
    const matchesSearch =
      searchQuery === "" ||
      (incident.name &&
        incident.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (incident.category &&
        incident.category.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (year && year.toString().includes(searchQuery));

    return matchesYear && matchesSearch;
  });

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

              <div className="command-output">
                <div className="loading-bar">
                  <div className="loading-progress"></div>
                </div>
                <div className="output-text">
                  Found {filteredIncidents.length} incidents in database.
                </div>
              </div>
            </div>

            <div className="console-section catalog-filters">
              <div className="command-line">
                <span className="prompt">user@archive:~$</span>
                <span className="command">set_filters --year --search</span>
              </div>

              <div className="search-container">
                <input
                  type="text"
                  placeholder="Search by name, category, or year..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="search-input"
                />
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

            <div className="console-section">
              <div className="command-line">
                <span className="prompt">user@archive:~$</span>
                <span className="command">display_results --format=grid</span>
              </div>

              <div className="command-output">
                <div className="output-text">
                  Found {filteredIncidents.length} incidents in database.
                </div>
              </div>

              {filteredIncidents.length > 0 ? (
                <div className="incident-grid">
                  {filteredIncidents.map((incident) => {
                    const year = getIncidentYear(incident);

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
                        className="incident-item"
                      >
                        <div className="incident-year">
                          {year || "Unknown Year"}
                        </div>
                        <div className="incident-name">
                          {incident.name || "Unknown Incident"}
                        </div>
                        <div className="incident-category">
                          {incident.category || "Uncategorized"}
                        </div>
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
