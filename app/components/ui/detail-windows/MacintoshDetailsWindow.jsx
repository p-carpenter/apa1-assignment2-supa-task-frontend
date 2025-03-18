import React from "react";
import { formatDateForDisplay } from "@/app/utils/formatting/dateUtils";
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
              {formatDateForDisplay(incident.incident_date)}
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
                    <div className={`heading ${styles.heading}`}>
                      <p className={styles.compactText}>
                        {incident.description}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MacintoshDetailsWindow;
