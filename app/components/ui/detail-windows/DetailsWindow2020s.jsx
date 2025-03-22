import React, { useState, useEffect } from "react";
import { formatDateForDisplay } from "@/app/utils/formatting/dateUtils";
import styles from "./DetailsWindow2020s.module.css";
import {
  getSeverityStyle,
  getCategoryStyle,
} from "@/app/utils/styling/getIncidentMetadataStyles";

const DetailsWindow2020s = ({ incident }) => {
  const [isDarkMode, setIsDarkMode] = useState(true);

  useEffect(() => {
    if (
      window.matchMedia &&
      window.matchMedia("(prefers-color-scheme: dark)").matches
    ) {
      setIsDarkMode(true);
    }

    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handleChange = (e) => setIsDarkMode(e.matches);
    mediaQuery.addEventListener("change", handleChange);

    return () => mediaQuery.removeEventListener("change", handleChange);
  }, []);

  if (!incident) return null;

  const categoryStyle = getCategoryStyle(incident.category, isDarkMode);
  const severityStyle = getSeverityStyle(incident.severity, isDarkMode);

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
  };

  return (
    <div
      className={`${styles.macosWindow} ${isDarkMode ? styles.darkMode : ""}`}
      data-testid="2020s-window"
    >
      <div className={styles.windowHeader}>
        <div className={styles.headerControls}>
          <h2 className={styles.headerTitle}>
            {incident.name || "Unknown Incident"}
          </h2>
          <button
            className={styles.darkModeToggle}
            onClick={toggleDarkMode}
            aria-label={
              isDarkMode ? "Switch to light mode" : "Switch to dark mode"
            }
          >
            {isDarkMode ? "☀" : "☾"}
          </button>
        </div>
      </div>

      {/* Metadata Pills */}
      <div className={styles.metadataContainer}>
        <div className={styles.metadataPill}>
          <span data-testid="incident-date">
            {formatDateForDisplay(incident.incident_date)}
          </span>
        </div>
        <div className={styles.metadataPill} style={categoryStyle}>
          <span>{incident.category || "Unknown"}</span>
        </div>
        <div className={styles.metadataPill} style={severityStyle}>
          <span data-testid="severity-indicator">
            {incident.severity || "Unknown"}
          </span>
        </div>
      </div>

      {/* Content Area */}
      <div className={styles.windowContent}>
        <div className={styles.contentSection}>
          <div className={styles.sectionContent}>
            <p>{incident.description || "No description available."}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DetailsWindow2020s;
