import React from "react";
import { formatDateForDisplay } from "@/app/utils/formatting/dateUtils";
import styles from "./MaterialDetailsWindow.module.css";

const MaterialDetailsWindow = ({ incident }) => {
  if (!incident) return null;

  const getSeverityColor = (severity) => {
    if (!severity) return "#3498db"; // Default slate

    const lowerSeverity = severity.toLowerCase();
    if (lowerSeverity.includes("critical")) return "#d84a4a"; // Red
    if (lowerSeverity.includes("high")) return "#e67e22"; // Orange
    if (lowerSeverity.includes("moderate")) return "#f3c32c"; // Amber
    if (lowerSeverity.includes("low")) return "#29a35a"; // Green
  };

  const severityColor = getSeverityColor(incident.severity);

  return (
    <div className={styles.container} data-testid="2010s-window">
      {/* Header with incident name and metadata */}
      <div
        className={styles.header_area}
        style={{ backgroundColor: severityColor }}
      >
        <div className={styles.header_top}>
          <h2 className={styles.title}>
            {incident.name || "Unknown Incident"}
          </h2>
        </div>

        <div className={styles.tags_container}>
          <div className={styles.tag}>
            {formatDateForDisplay(incident.incident_date)}
          </div>
          <div className={styles.tag} data-testid="category-tag">
            {incident.category || "Unknown"}
          </div>
          <div className={styles.tag} data-testid="severity-tag">
            {incident.severity || "Unknown"}
          </div>
        </div>
      </div>

      {/* Content area */}
      <div className={styles.content_area_compact}>
        <div className={styles.section_row}>
          <div className={styles.section_content}>
            <p>{incident.description}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MaterialDetailsWindow;
