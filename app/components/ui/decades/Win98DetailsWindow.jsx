import React from "react";
import { formatDate } from "@/app/utils/formatting/dateUtils";
import styles from "./Win98DetailsWindow.module.css";
import ExpandableSection from "../shared/ExpandableSection";

/**
 * Windows 98 Styled Details Window (1990s)
 *
 * This component uses 98.css to recreate the iconic Windows 98 UI
 * with a compact, space-efficient layout and expandable sections.
 */
const Win98DetailsWindow = ({ incident }) => {
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
              <span>{formatDate(incident.incident_date)}</span>
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

          {/* Content sections - now expandable */}
          <div className={styles.contentSections}>
            {/* What Happened Section - Always expanded by default */}
            <ExpandableSection
              title={
                <div className={styles.sectionTitleWrapper}>
                  <span className={styles.sectionTitleText}>What Happened</span>
                </div>
              }
              sectionClassName={styles.contentSection}
              contentClassName={styles.sectionText}
              expandedByDefault={true}
              maxLines={3}
              minLinesForExpansion={3}
            >
              {incident.description}
            </ExpandableSection>

            {/* Why It Happened Section */}
            {incident.cause && (
              <ExpandableSection
                title={
                  <div className={styles.sectionTitleWrapper}>
                    <span className={styles.sectionTitleText}>Why It Happened</span>
                  </div>
                }
                sectionClassName={styles.contentSection}
                contentClassName={styles.sectionText}
                maxLines={2}
                minLinesForExpansion={3}
              >
                {incident.cause}
              </ExpandableSection>
            )}

            {/* Consequences Section */}
            {incident.consequences && (
              <ExpandableSection
                title={
                  <div className={styles.sectionTitleWrapper}>
                    <span className={styles.sectionTitleText}>Consequences</span>
                  </div>
                }
                sectionClassName={styles.contentSection}
                contentClassName={styles.sectionText}
                maxLines={2}
                minLinesForExpansion={3}
              >
                {incident.consequences}
              </ExpandableSection>
            )}

            {/* Resolution Time Section */}
            {incident.time_to_resolve && (
              <ExpandableSection
                title={
                  <div className={styles.sectionTitleWrapper}>
                    <span className={styles.sectionTitleText}>Resolution Time</span>
                  </div>
                }
                sectionClassName={styles.contentSection}
                contentClassName={styles.sectionText}
                maxLines={1}
                minLinesForExpansion={3}
              >
                {incident.time_to_resolve}
              </ExpandableSection>
            )}
          </div>
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
