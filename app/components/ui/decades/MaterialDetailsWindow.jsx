import React from "react";
import { formatDate } from "@/app/utils/formatting/dateUtils";
import styles from "./MaterialDetailsWindow.module.css";
import ExpandableSection from "../shared/ExpandableSection";

/**
 * Material Design styled window (2010s)
 *
 * Redesigned with a compact layout without cards
 */
const MaterialDetailsWindow = ({ incident }) => {
  if (!incident) return null;

  const getSeverityColor = (severity) => {
    if (!severity) return "#5a6a8a"; // Default slate

    const lowerSeverity = severity.toLowerCase();
    if (lowerSeverity.includes("critical")) return "#d84a4a"; // Red
    if (lowerSeverity.includes("high")) return "#e67e22"; // Orange
    if (lowerSeverity.includes("medium")) return "#f3c32c"; // Amber
    if (lowerSeverity.includes("low")) return "#29a35a"; // Green

    return "#3498db"; // Default blue
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
          <div className={styles.tag}>{formatDate(incident.incident_date)}</div>
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
          <ExpandableSection
            title={
              <div className={styles.section_header}>
                <span
                  className={styles.icon_badge}
                  style={{ backgroundColor: severityColor }}
                >
                  !
                </span>
                <span className={styles.section_title}>What Happened</span>
              </div>
            }
            expandedByDefault={true}
            maxLines={3}
            contentClassName={styles.section_content}
            minLinesForExpansion={3}
          >
            <p>{incident.description}</p>
          </ExpandableSection>
        </div>

        {incident.cause && (
          <div className={styles.section_row}>
            <ExpandableSection
              title={
                <div className={styles.section_header}>
                  <span
                    className={styles.icon_badge}
                    style={{ backgroundColor: "#3498db" }}
                  >
                    ?
                  </span>
                  <span className={styles.section_title}>Why It Happened</span>
                </div>
              }
              maxLines={2}
              contentClassName={styles.section_content}
              minLinesForExpansion={3}
            >
              <p>{incident.cause}</p>
            </ExpandableSection>
          </div>
        )}

        {incident.consequences && (
          <div className={styles.section_row}>
            <ExpandableSection
              title={
                <div className={styles.section_header}>
                  <span
                    className={styles.icon_badge}
                    style={{ backgroundColor: "#e67e22" }}
                  >
                    ⚠
                  </span>
                  <span className={styles.section_title}>Consequences</span>
                </div>
              }
              maxLines={2}
              contentClassName={styles.section_content}
              minLinesForExpansion={3}
            >
              <p>{incident.consequences}</p>
            </ExpandableSection>
          </div>
        )}

        {incident.time_to_resolve && (
          <div className={styles.section_row}>
            <ExpandableSection
              title={
                <div className={styles.section_header}>
                  <span
                    className={styles.icon_badge}
                    style={{ backgroundColor: "#29a35a" }}
                  >
                    ⏱
                  </span>
                  <span className={styles.section_title}>Resolution Time</span>
                </div>
              }
              maxLines={1}
              contentClassName={styles.section_content}
              minLinesForExpansion={3}
            >
              <p>{incident.time_to_resolve}</p>
            </ExpandableSection>
          </div>
        )}
      </div>
    </div>
  );
};

export default MaterialDetailsWindow;
