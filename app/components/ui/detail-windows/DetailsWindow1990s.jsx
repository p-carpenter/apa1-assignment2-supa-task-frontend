import React from "react";
import { formatDateForDisplay } from "@/app/utils/formatting/dateUtils";
import styles from "./DetailsWindow1990s.module.css";

/**
 * Windows 98 Styled Details Window (1990s)
 *
 * This component uses 98.css to recreate the Windows 98 UI.
 */
const DetailsWindow1990s = ({ incident }) => {
  if (!incident) return null;

  return (
    <div className={`win98 ${styles.mainWindow}`}>
      <div className="window" data-testid="1990s-window">
        <div className="title-bar" data-testid="win98-title-bar">
          <div className="title-bar-text">
            {incident.name || "Unknown Incident"}
          </div>
        </div>

        <div className={`window-body ${styles.windowBodyCompact}`}>
          {/* Metadata row */}
          <div className={styles.metadataRow}>
            <div className={styles.metadataItem}>
              <span className={styles.metadataLabel}>Date:</span>
              <span data-testid="incident-date">
                {formatDateForDisplay(incident.incident_date)}
              </span>
            </div>
            <div className={styles.metadataItem}>
              <span className={styles.metadataLabel}>Category:</span>
              <span>{incident.category || "Unknown"}</span>
            </div>
            <div className={styles.metadataItem}>
              <span className={styles.metadataLabel}>Severity:</span>
              <span>{incident.severity || "Unknown"}</span>
            </div>
          </div>

          <hr className={styles.divider} />

          {/* Content section */}
          <div className={styles.contentSections}>
            <div className={styles.contentSection}>
              <div className={styles.sectionText}>
                {incident.description || "No description available."}
              </div>
            </div>
          </div>
        </div>

        <div className="status-bar">
          <div className="status-bar-field">Tech Incident Archive</div>
          <div className="status-bar-field">
            {formatDateForDisplay(incident.incident_date)}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DetailsWindow1990s;
