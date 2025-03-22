import React from "react";
import { formatDateForDisplay } from "@/app/utils/formatting/dateUtils";
import styles from "./DetailsWindow2010s.module.css";
import { getSeverityStyle } from "@/app/utils/styling/getIncidentMetadataStyles";

const DetailsWindow2010s = ({ incident }) => {
  if (!incident) return null;

  const severityStyle = getSeverityStyle(incident.severity);

  return (
    <div className={styles.container} data-testid="2010s-window">
      {/* Header with incident name and metadata */}
      <div className={styles.headerArea} style={severityStyle}>
        <div className={styles.headerTop}>
          <h2 className={styles.title}>
            {incident.name || "Unknown Incident"}
          </h2>
        </div>

        <div className={styles.tagsContainer}>
          <div className={styles.tag} data-testid="incident-date">
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
      <div className={styles.contentArea}>
        <div className={styles.sectionRow}>
          <div className={styles.sectionContent}>
            <p>{incident.description || "No description available."}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DetailsWindow2010s;
