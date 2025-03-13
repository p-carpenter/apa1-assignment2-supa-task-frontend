import React from "react";
import { formatDate } from "@/app/utils/formatting/dateUtils";
import styles from "./MacintoshDetailsWindow.module.css";
import ExpandableSection from "../shared/ExpandableSection";

const MacintoshDetailsWindow = ({ incident }) => {
  if (!incident) return null;

  return (
    <div className={`apple-macintosh ${styles.macWindow}`}>
      <div className="window">
        <div className="title-bar">
          <div className="title">{incident.name || "Unknown"}</div>
        </div>

        <div className={`standard-dialog ${styles.standardDialog}`}>
          <div className={styles.compactFieldRow}>
            <div className={styles.fieldLabel}>
              {formatDate(incident.incident_date)}
            </div>
                        <div className={styles.fieldLabel}>
              {incident.category || "Unknown"}
            </div>
            <div className={styles.fieldLabel}>
              {incident.severity || "Unknown"}
            </div>
          </div>

          <div className={styles.thinSeparator}></div>

          {/* Incident details sections */}
          <div className={styles.window_pane}>
            <div className={styles.inner_content}>
              {/* Description section */}
              <div className={styles.sectionContainer}>
                <div className={`outer-border ${styles.outerBorder}`}>
                  <div className={`inner-border ${styles.innerBorder}`}>
                    <ExpandableSection
                      title="What Happened"
                      titleClassName={`heading ${styles.heading}`}
                      expandedByDefault={true}
                      maxLines={3}
                      minLinesForExpansion={3}
                    >
                      <p className={styles.compactText}>{incident.description}</p>
                    </ExpandableSection>
                  </div>
                </div>
              </div>

              {/* Root cause section */}
              {incident.cause && (
                <div className={styles.sectionContainer}>
                  <div className={`outer-border ${styles.outerBorder}`}>
                    <div className={`inner-border ${styles.innerBorder}`}>
                      <ExpandableSection
                        title="Why It Happened"
                        titleClassName={`heading ${styles.heading}`}
                        maxLines={2}
                        minLinesForExpansion={3}
                      >
                        <p className={styles.compactText}>{incident.cause}</p>
                      </ExpandableSection>
                    </div>
                  </div>
                </div>
              )}

              {/* Consequences section */}
              {incident.consequences && (
                <div className={styles.sectionContainer}>
                  <div className={`outer-border ${styles.outerBorder}`}>
                    <div className={`inner-border ${styles.innerBorder}`}>
                      <ExpandableSection
                        title="Consequences"
                        titleClassName={`heading ${styles.heading}`}
                        maxLines={2}
                        minLinesForExpansion={3}
                      >
                        <p className={styles.compactText}>{incident.consequences}</p>
                      </ExpandableSection>
                    </div>
                  </div>
                </div>
              )}

              {/* Resolution time section */}
              {incident.time_to_resolve && (
                <div className={styles.sectionContainer}>
                  <div className={`outer-border ${styles.outerBorder}`}>
                    <div className={`inner-border ${styles.innerBorder}`}>
                      <ExpandableSection
                        title="Resolution Time"
                        titleClassName={`heading ${styles.heading}`}
                        maxLines={1}
                        minLinesForExpansion={3}
                      >
                        <p className={styles.compactText}>{incident.time_to_resolve}</p>
                      </ExpandableSection>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MacintoshDetailsWindow;
