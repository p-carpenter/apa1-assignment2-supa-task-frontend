import React, { useState, useEffect } from "react";
import { formatDate } from "@/app/utils/formatting/dateUtils";
import styles from "./GlassmorphicDetailsWindow.module.css";
import ExpandableSection from "../shared/ExpandableSection";

const GlassmorphicDetailsWindow = ({ incident }) => {
  const [isDarkMode, setIsDarkMode] = useState(false);

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

  const getCategoryColor = (category) => {
    if (!category) return isDarkMode ? "#64748b" : "#64748b";

    const lowerCategory = category.toLowerCase();
    if (lowerCategory.includes("security"))
      return isDarkMode ? "#a78bfa" : "#8b5cf6";
    if (lowerCategory.includes("hardware"))
      return isDarkMode ? "#f472b6" : "#ec4899";
    if (lowerCategory.includes("software"))
      return isDarkMode ? "#60a5fa" : "#3b82f6";
    if (lowerCategory.includes("network"))
      return isDarkMode ? "#34d399" : "#10b981";
    if (lowerCategory.includes("database"))
      return isDarkMode ? "#fbbf24" : "#f59e0b";

    return isDarkMode ? "#71717a" : "#64748b";
  };

  const getSeverityClass = (severity) => {
    if (!severity) return styles.severity_unknown;

    const lowerSeverity = severity.toLowerCase();
    if (lowerSeverity.includes("high")) return styles.severity_high;
    if (lowerSeverity.includes("medium")) return styles.severity_medium;
    if (lowerSeverity.includes("low")) return styles.severity_low;

    return styles.severity_unknown;
  };

  const categoryColor = getCategoryColor(incident.category);
  const severityClass = getSeverityClass(incident.severity);

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
  };

  return (
    <div
      className={`${styles.macos_window} ${isDarkMode ? styles.dark_mode : ""}`}
      data-testid="2020s-window"
    >
      <div className={styles.window_header}>
        <div className={styles.header_controls}>
          <h2 className={styles.header_title}>
            {incident.name || "Unknown Incident"}
          </h2>
          <button
            className={styles.dark_mode_toggle}
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
      <div className={styles.metadata_container}>
        <div className={styles.metadata_pill}>
          <span>{formatDate(incident.incident_date)}</span>
        </div>
        <div
          className={styles.metadata_pill}
          style={{ backgroundColor: categoryColor }}
        >
          <span>{incident.category || "Unknown"}</span>
        </div>
        <div
          className={`${styles.metadata_pill} ${styles[`severity_${incident.severity?.toLowerCase() || "unknown"}`]}`}
        >
          <span data-testid="severity-indicator" className={severityClass}>
            {incident.severity || "Unknown"}
          </span>
        </div>
      </div>

      {/* Content Area */}
      <div className={styles.window_content}>
        <div className={styles.content_section}>
          <ExpandableSection
            expandedByDefault={true}
            maxLines={10}
            contentClassName={styles.section_content}
            minLinesForExpansion={10}
          >
            <p>{incident.description}</p>
          </ExpandableSection>
        </div>
      </div>
    </div>
  );
};

export default GlassmorphicDetailsWindow;
