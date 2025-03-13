import React from "react";
import { formatDate } from "@/app/utils/formatting/dateUtils";
import styles from "./AeroDetailsWindow.module.css";
import ExpandableSection from "../shared/ExpandableSection";

/**
 * Glass Window Effect for 2000s style
 *
 * Redesigned with expandable sections that maintain the Aero glass
 * aesthetic while allowing for content expansion without scrolling.
 */
const AeroDetailsWindow = ({ incident }) => {
  if (!incident) return null;

  return (
    <div className={styles.blurBackground}>
      <div className={styles.windowContainer} data-testid="2000s-window">
        {/* Background and window layers */}
        <div className={styles.windowBackground}></div>

        {/* Diagonal highlights */}
        <div className={styles.diagonalHighlight1}></div>
        <div className={styles.diagonalHighlight2}></div>
        <div className={styles.diagonalHighlight3}></div>
        <div className={styles.diagonalHighlight4}></div>

        <div className={styles.whiteBorder}></div>
        <div className={styles.blackBorder}></div>
        <div className={styles.blueBorder}></div>

        {/* Title Bar */}
        <div className={styles.header}>
          <h2 className={styles.windowTitle}>
            {incident.name || "Unknown Incident"}
          </h2>
        </div>

        {/* Content area with no cards */}
        <div className={styles.contentArea}>
          {/* Metadata row for Date, Category, Severity */}
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

          {/* Content sections with expandable behavior */}
          <div className={styles.contentSections}>
            {/* What Happened Section - Always expanded by default */}
            <ExpandableSection
              title={<h3 className={styles.sectionTitle}>What Happened</h3>}
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
                title={<h3 className={styles.sectionTitle}>Why It Happened</h3>}
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
                title={<h3 className={styles.sectionTitle}>Consequences</h3>}
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
                title={<h3 className={styles.sectionTitle}>Resolution Time</h3>}
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
      </div>
    </div>
  );
};

export default AeroDetailsWindow;
