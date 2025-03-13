import React from "react";
import { formatDate } from "@/app/utils/formatting/dateUtils";
import styles from "./GlassmorphicDetailsWindow.module.css";
import ExpandableSection from "../shared/ExpandableSection";

/**
 * Modern macOS Styled Details Window (2020s)
 *
 * This component implements a modern macOS-inspired UI with subtle
 * glass effect, rounded corners, and clean typography, using a
 * compact, auto-height layout without scrolling.
 */
const GlassmorphicDetailsWindow = ({ incident }) => {
  if (!incident) return null;

  const getCategoryColor = (category) => {
    if (!category) return "#64748b";

    const lowerCategory = category.toLowerCase();
    if (lowerCategory.includes("security")) return "#8b5cf6";
    if (lowerCategory.includes("hardware")) return "#ec4899";
    if (lowerCategory.includes("software")) return "#3b82f6";
    if (lowerCategory.includes("network")) return "#10b981";
    if (lowerCategory.includes("database")) return "#f59e0b";

    return "#64748b";
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

  return (
    <div className={styles.macos_window} data-testid="2020s-window">
      <div className={styles.macos_header}>
        <h2 className={styles.header_title}>
          {incident.name || "Unknown Incident"}
        </h2>
      </div>

      {/* Compact Metadata Pills */}
      <div className={styles.metadata_container_compact}>
        <div className={styles.metadata_pill}>
          <span className={styles.pill_icon}>📅</span>
          <span>{formatDate(incident.incident_date)}</span>
        </div>
        <div
          className={styles.metadata_pill}
          style={{ backgroundColor: categoryColor }}
        >
          <span className={styles.pill_icon}>📁</span>
          <span>{incident.category || "Unknown"}</span>
        </div>

        <div
          className={`${styles.metadata_pill} ${styles[`severity_${incident.severity?.toLowerCase() || "unknown"}`]}`}
        >
          <span className={styles.pill_icon}>🚨</span>
          <span data-testid="severity-indicator" className={severityClass}>
            {incident.severity || "Unknown"}
          </span>
        </div>
      </div>

      {/* Content Area - No scrolling */}
      <div className={styles.macos_content_auto}>
        <div className={styles.macos_section_compact}>
          <ExpandableSection
            title={
              <div className={styles.section_header_compact}>
                <div className={styles.section_icon}>⚠️</div>
                <h3 className={styles.section_title}>What Happened</h3>
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
          <div className={styles.macos_section_compact}>
            <ExpandableSection
              title={
                <div className={styles.section_header_compact}>
                  <div className={styles.section_icon}>🔍</div>
                  <h3 className={styles.section_title}>Why It Happened</h3>
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
          <div className={styles.macos_section_compact}>
            <ExpandableSection
              title={
                <div className={styles.section_header_compact}>
                  <div className={styles.section_icon}>💥</div>
                  <h3 className={styles.section_title}>Consequences</h3>
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
          <div className={styles.macos_section_compact}>
            <ExpandableSection
              title={
                <div className={styles.section_header_compact}>
                  <div className={styles.section_icon}>🕒</div>
                  <h3 className={styles.section_title}>Resolution Time</h3>
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

      {/* Footer */}
      <div className={styles.macos_footer_compact}>
        <div className={styles.footnote}>
          Tech Failures Museum • {new Date().getFullYear()}
        </div>
      </div>
    </div>
  );
};

export default GlassmorphicDetailsWindow;
