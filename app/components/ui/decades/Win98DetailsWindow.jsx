import React from "react";
import { formatDate } from "@/app/utils/formatting/dateUtils";
import styles from "./Win98DetailsWindow.module.css";

/**
 * Windows 98 Styled Details Window (1990s)
 *
 * This component uses 98.css to recreate the iconic Windows 98 UI
 * with pixel-perfect borders, classic form elements, and vintage styling.
 */
const Win98DetailsWindow = ({ incident }) => {
  if (!incident) return null;

  return (
    <div className={`win98 ${styles.mainWindow}`}>
      <div className="window" data-testid="win98-window">
        <div className="title-bar" data-testid="win98-title-bar">
          <div className="title-bar-text">
            {incident.name || "Unknown Incident"}
          </div>
        </div>

        <div className="window-body">
          <div className={styles.metadataSection}>
            <div className="field-row">
              <label>Category:</label>
              <span className={styles.metadataValue}>
                {incident.category || "Unknown"}
              </span>
            </div>
            <div className="field-row">
              <label>Severity:</label>
              <span className={styles.metadataValue}>
                {incident.severity || "Unknown"}
              </span>
            </div>
            <div className="field-row">
              <label>Date:</label>
              <span className={styles.metadataValue}>
                {formatDate(incident.incident_date)}
              </span>
            </div>
          </div>

          <hr className={styles.divider} />

          <section className={styles.contentSection}>
            <div className={styles.sectionHeader}>
              <p className={styles.sectionTitle}>What Happened</p>
            </div>
            <div className={styles.sectionContent}>
              <p>{incident.description}</p>
            </div>
          </section>

          {incident.cause && (
            <section className={styles.contentSection}>
              <div className={styles.sectionHeader}>
                <p className={styles.sectionTitle}>Why It Happened</p>
              </div>
              <div className={styles.sectionContent}>
                <p>{incident.cause}</p>
              </div>
            </section>
          )}

          {incident.consequences && (
            <section className={styles.contentSection}>
              <div className={styles.sectionHeader}>
                <p className={styles.sectionTitle}>Consequences</p>
              </div>
              <div className={styles.sectionContent}>
                <p>{incident.consequences}</p>
              </div>
            </section>
          )}

          {incident.time_to_resolve && (
            <section className={styles.contentSection}>
              <div className={styles.sectionHeader}>
                <p className={styles.sectionTitle}>Resolution Time</p>
              </div>
              <div className={styles.sectionContent}>
                <p>{incident.time_to_resolve}</p>
              </div>
            </section>
          )}
        </div>

        <div className="status-bar">
          <div className="status-bar-field">Tech Incident Archive</div>
          <div className="status-bar-field">
            {formatDate(incident.incident_date)}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Win98DetailsWindow;
