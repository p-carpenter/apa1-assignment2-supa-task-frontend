import React from "react";
import { formatDate } from "@/app/utils/formatting/dateUtils";
import styles from "./MaterialDetailsWindow.module.css";

const MaterialDetailsWindow = ({ incident }) => {
  if (!incident) return null;

  const getSeverityColor = (severity) => {
    if (!severity) return "#757575";

    const lowerSeverity = severity.toLowerCase();
    if (lowerSeverity.includes("critical")) return "#d32f2f"; // Red
    if (lowerSeverity.includes("high")) return "#f57c00"; // Orange
    if (lowerSeverity.includes("medium")) return "#fbc02d"; // Amber
    if (lowerSeverity.includes("low")) return "#388e3c"; // Green

    return "#1976d2"; // Default blue
  };

  const severityColor = getSeverityColor(incident.severity);

  return (
    <div className={styles.material_container}>
      <div
        className={styles.app_bar}
        style={{ backgroundColor: severityColor }}
      >
        <div className={styles.app_bar_content}>
          <div className={styles.app_title}>
            {incident.name || "Unknown Incident"}
          </div>
          <div className={styles.app_actions}>
            <div className={styles.action_button}>
              <span className={styles.material_icon}>search</span>
            </div>
            <div className={styles.action_button}>
              <span className={styles.material_icon}>more_vert</span>
            </div>
          </div>
        </div>
      </div>

      <div className={styles.metadata_bar} data-testid="metadata_bar">
        <div className={styles.chips_container}>
          <div className={styles.chip} data-testid="category-chip">
            <span className={styles.material_icon_small}>label</span>
            <span>{incident.category || "Unknown"}</span>
          </div>
          <div
            className={styles.chip} data-testid="severity-chip"
            style={{
              backgroundColor: `${severityColor}20`,
              color: severityColor,
            }}
          >
            <span className={styles.material_icon_small}>warning</span>
            <span>{incident.severity || "Unknown"}</span>
          </div>
          <div className={styles.chip}>
            <span className={styles.material_icon_small}>event</span>
            <span>{formatDate(incident.incident_date)}</span>
          </div>
        </div>
      </div>


      <div className={styles.content_area}>
        <div className={styles.material_card} data-testid="material_card">
          <div className={styles.card_header}>
            <span className={styles.material_icon_medium}>error_outline</span>
            <h3 className={styles.card_title}>What Happened</h3>
          </div>
          <div className={styles.card_content}>
            <p>{incident.description}</p>
          </div>
        </div>

        {incident.cause && (
          <div className={styles.material_card}>
            <div className={styles.card_header}>
              <span className={styles.material_icon_medium}>help_outline</span>
              <h3 className={styles.card_title}>Why It Happened</h3>
            </div>
            <div className={styles.card_content}>
              <p>{incident.cause}</p>
            </div>
          </div>
        )}

        {incident.consequences && (
          <div className={styles.material_card}>
            <div className={styles.card_header}>
              <span className={styles.material_icon_medium}>
                report_problem
              </span>
              <h3 className={styles.card_title}>Consequences</h3>
            </div>
            <div className={styles.card_content}>
              <p>{incident.consequences}</p>
            </div>
          </div>
        )}

        {incident.time_to_resolve && (
          <div className={styles.material_card}>
            <div className={styles.card_header}>
              <span className={styles.material_icon_medium}>schedule</span>
              <h3 className={styles.card_title}>Resolution Time</h3>
            </div>
            <div className={styles.card_content}>
              <p>{incident.time_to_resolve}</p>
            </div>
          </div>
        )}
      </div>

      <div className={styles.fab} style={{ backgroundColor: severityColor }}>
        <span className={styles.material_icon}>share</span>
      </div>
    </div>
  );
};

export default MaterialDetailsWindow;
