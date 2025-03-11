import React from "react";
import { formatDate } from "@/app/utils/formatting/dateUtils";
import styles from "./AeroDetailsWindow.module.css";

/**
 * Windows Vista "Aero Glass" Styled Details Window (2000s)
 *
 * Authentic recreation of the Windows Vista Aero interface with
 * glass effects, blurred transparent surfaces, and glossy highlights.
 */
const AeroDetailsWindow = ({ incident }) => {
  if (!incident) return null;

  return (
    <div className={styles.windows_explorer}>
      <div className={styles.explorer_top_bar}>
        {/* Titlebar window buttons */}
        <div className={styles.right_top}>
          <span
            className={`${styles.top_bar_button} ${styles.highlight} ${styles.highlight_mouse_over}`}
          >
            _
          </span>
          <span
            className={`${styles.top_bar_button} ${styles.highlight} ${styles.highlight_mouse_over}`}
          >
            □
          </span>
          <span
            className={`${styles.top_bar_button} ${styles.red_button_background} ${styles.highlight} ${styles.highlight_mouse_over}`}
          >
            &times;
          </span>
        </div>

        {/* Navigation Bar */}
        <div className={styles.windows_explorer_navigation}>
          <div className={styles.arrow_buttons}>
            <div
              className={`${styles.arrow_button} ${styles.disabled} ${styles.arrow_left} ${styles.circle_button} ${styles.primary_button_background}`}
            >
              <svg
                version="1.1"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <g id="icons">
                  <path
                    d="M20,10c-2.3-0.2-10,0-10,0V6c0-0.8-0.8-1.3-1.4-0.8l-6.3,6c-0.5,0.4-0.5,1.2,0,1.6l6.3,6c0.6,0.5,1.4,0,1.4-0.8 v-4c0,0,7.6,0.2,10,0c1.1-0.1,2-0.9,2-2C22,10.9,21.1,10.1,20,10z"
                    id="arrow"
                  />
                </g>
              </svg>
            </div>
            <div
              className={`${styles.arrow_button} ${styles.disabled} ${styles.circle_button} ${styles.primary_button_background}`}
            >
              <svg
                version="1.1"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <g id="icons">
                  <path
                    d="M20,10c-2.3-0.2-10,0-10,0V6c0-0.8-0.8-1.3-1.4-0.8l-6.3,6c-0.5,0.4-0.5,1.2,0,1.6l6.3,6c0.6,0.5,1.4,0,1.4-0.8 v-4c0,0,7.6,0.2,10,0c1.1-0.1,2-0.9,2-2C22,10.9,21.1,10.1,20,10z"
                    id="arrow"
                  />
                </g>
              </svg>
            </div>
          </div>

          <div className={`${styles.input_button} ${styles.highlight}`}>
            <img
              className={styles.folder_icon}
              src="https://www.iconshock.com/image/Vista/General/folder"
              alt="Folder"
            />
            <input
              spellCheck="false"
              type="text"
              value={`Incidents > ${incident.category || "Category"} > ${incident.name || "Incident"}`}
              readOnly
            />
            <div className={styles.input_button_icon}>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
              >
                <path d="M13.5 2c-5.621 0-10.211 4.443-10.475 10h-3.025l5 6.625 5-6.625h-2.975c.257-3.351 3.06-6 6.475-6 3.584 0 6.5 2.916 6.5 6.5s-2.916 6.5-6.5 6.5c-1.863 0-3.542-.793-4.728-2.053l-2.427 3.216c1.877 1.754 4.389 2.837 7.155 2.837 5.79 0 10.5-4.71 10.5-10.5s-4.71-10.5-10.5-10.5z" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className={styles.folder_content}>
        {/* Content Sections */}
        <div className={styles.aero_content}>
          {/* Info Bar */}
          <div className={styles.info_bar}>
            <div className={styles.vista_badge}>
              <span className={styles.badge_icon}></span>
              <span>{incident.category || "Unknown"}</span>
            </div>

            <div className={styles.vista_badge}>
              <span className={styles.severity_icon}></span>
              <span>{incident.severity || "Unknown"}</span>
            </div>
          </div>

          {/* What Happened Section */}
          <div className={styles.aero_panel}>
            <div className={styles.panel_header}>
              <div className={styles.panel_icon}></div>
              <h3 className={styles.panel_title}>What Happened</h3>
            </div>
            <div className={styles.panel_content}>
              <p>{incident.description}</p>
            </div>
          </div>

          {/* Why It Happened Section */}
          {incident.cause && (
            <div className={styles.aero_panel}>
              <div className={styles.panel_header}>
                <div
                  className={`${styles.panel_icon} ${styles.cause_icon}`}
                ></div>
                <h3 className={styles.panel_title}>Why It Happened</h3>
              </div>
              <div className={styles.panel_content}>
                <p>{incident.cause}</p>
              </div>
            </div>
          )}

          {/* Consequences Section */}
          {incident.consequences && (
            <div className={styles.aero_panel}>
              <div className={styles.panel_header}>
                <div
                  className={`${styles.panel_icon} ${styles.consequences_icon}`}
                ></div>
                <h3 className={styles.panel_title}>Consequences</h3>
              </div>
              <div className={styles.panel_content}>
                <p>{incident.consequences}</p>
              </div>
            </div>
          )}

          {/* Resolution Time Section */}
          {incident.time_to_resolve && (
            <div className={styles.aero_panel}>
              <div className={styles.panel_header}>
                <div
                  className={`${styles.panel_icon} ${styles.time_icon}`}
                ></div>
                <h3 className={styles.panel_title}>Resolution Time</h3>
              </div>
              <div className={styles.panel_content}>
                <p>{incident.time_to_resolve}</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Status Bar */}
      <div className={styles.status_bar}>
        <div className={styles.status_item}></div>
        <span className={styles.status_icon}></span>
        <span>Ready</span>
      </div>
      <div className={styles.status_item_right}>
        <span>{formatDate(incident.incident_date)}</span>
      </div>
    </div>
  );
};

export default AeroDetailsWindow;
