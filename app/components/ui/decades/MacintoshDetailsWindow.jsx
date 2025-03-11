import React from "react";
import { formatDate } from "@/app/utils/formatting/dateUtils";
import styles from "./MacintoshDetailsWindow.module.css";

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
              {incident.severity || "Unknown"}
            </div>
            <div className={styles.fieldLabel}>
              {incident.category || "Unknown"}
            </div>
          </div>

          <div className="separator"></div>

          {/* Incident details sections */}
          <div className={styles.window_pane}>
            <div className={styles.inner_content}>
              {/* Description section */}
              <div className={styles.sectionContainer}>
                <div className={`outer-border ${styles.outerBorder}`}>
                  <div className={`inner-border ${styles.innerBorder}`}>
                    <h1 className={`heading ${styles.heading}`}>
                      What Happened
                    </h1>
                    <p className={styles.compactText}>{incident.description}</p>
                  </div>
                </div>
              </div>

              {/* Root cause section */}
              {incident.cause && (
                <div className={styles.sectionContainer}>
                  <div className={`outer-border ${styles.outerBorder}`}>
                    <div className={`inner-border ${styles.innerBorder}`}>
                      <h1 className={`heading ${styles.heading}`}>
                        Why It Happened
                      </h1>
                      <p className={styles.compactText}>{incident.cause}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Consequences section */}
              {incident.consequences && (
                <div className={styles.sectionContainer}>
                  <div className={`outer-border ${styles.outerBorder}`}>
                    <div className={`inner-border ${styles.innerBorder}`}>
                      <h1 className={`heading ${styles.heading}`}>
                        Consequences
                      </h1>
                      <p className={styles.compactText}>
                        {incident.consequences}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Resolution time section */}
              {incident.time_to_resolve && (
                <div className={styles.sectionContainer}>
                  <div className={`outer-border ${styles.outerBorder}`}>
                    <div className={`inner-border ${styles.innerBorder}`}>
                      <h1 className={`heading ${styles.heading}`}>
                        Resolution Time
                      </h1>
                      <p className={styles.compactText}>
                        {incident.time_to_resolve}
                      </p>
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
