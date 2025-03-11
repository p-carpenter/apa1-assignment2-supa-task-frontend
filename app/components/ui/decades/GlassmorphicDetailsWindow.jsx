import React, { useState } from "react";
import { formatDate } from "@/app/utils/formatting/dateUtils";
import styles from "./GlassmorphicDetailsWindow.module.css";

/**
 * Glassmorphic Styled Details Window (2020s)
 *
 * This component implements the popular Glassmorphism UI design trend
 * with frosted glass effects, subtle gradients, and colorful accents.
 * Includes dark/light mode toggle for modern UI experience.
 */
const GlassmorphicDetailsWindow = ({ incident }) => {
  if (!incident) return null;

  const [darkMode, setDarkMode] = useState(false);

  
  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  
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
    <div
      className={`${styles.glass_container} ${darkMode ? styles.dark : ""}`}
      data-testid="glassmorphic-container"
    >
      {/* Blurred Background Shapes */}
      <div className={styles.shape_1}></div>
      <div className={styles.shape_2}></div>
      <div className={styles.shape_3}></div>

      {/* Header */}
      <div className={styles.glass_header}>
        <h2 className={styles.header_title}>
          {incident.name || "Unknown Incident"}
        </h2>

        {/* Header Controls */}
        <div className={styles.header_controls}>
          <button
            className={styles.mode_toggle}
            onClick={toggleDarkMode}
            aria-label={
              darkMode ? "Switch to light mode" : "Switch to dark mode"
            }
          >
            <span className={styles.icon}>{darkMode ? "🌙" : "☀️"}</span>
          </button>
        </div>
      </div>

      {/* Badges */}
      <div className={styles.badges_container}>
        <div
          className={styles.category_badge}
          style={{ "--accent-color": categoryColor }}
        >
          <span className={styles.badge_icon}>📁</span>
          <span>{incident.category || "Unknown"}</span>
        </div>

        <div className={styles.severity_badge}>
          <span className={styles.badge_icon}>🚨</span>
          <span data-testid="severity-indicator" className={severityClass}>
            {incident.severity || "Unknown"}
          </span>
        </div>

        <div className={styles.date_badge}>
          <span className={styles.badge_icon}>📅</span>
          <span>{formatDate(incident.incident_date)}</span>
        </div>
      </div>

      {/* Content Area */}
      <div className={styles.glass_content}>
        {/* What Happened */}
        <div
          className={styles.glass_card}
          style={{ "--delay": "0.1s" }}
          data-testid="glass-card"
        >
          <div className={styles.card_header}>
            <div className={styles.card_icon} style={{ background: "#f43f5e" }}>
              <span>⚠️</span>
            </div>
            <h3 className={styles.card_title}>What Happened</h3>
          </div>
          <div className={styles.card_content}>
            <p>{incident.description}</p>
          </div>
        </div>

        {/* Why It Happened */}
        <div
          className={styles.glass_card}
          style={{ "--delay": "0.2s" }}
          data-testid="cause-section"
        >
          <div className={styles.card_header}>
            <div className={styles.card_icon} style={{ background: "#8b5cf6" }}>
              <span>🔍</span>
            </div>
            <h3 className={styles.card_title}>Why It Happened</h3>
          </div>
          <div className={styles.card_content}>
            <p>{incident.cause || "No cause information available"}</p>
          </div>
        </div>

        {/* Consequences */}
        <div className={styles.glass_card} style={{ "--delay": "0.3s" }}>
          <div className={styles.card_header}>
            <div className={styles.card_icon} style={{ background: "#0ea5e9" }}>
              <span>💥</span>
            </div>
            <h3 className={styles.card_title}>Consequences</h3>
          </div>
          <div className={styles.card_content}>
            <p>
              {incident.consequences || "No consequences information available"}
            </p>
          </div>
        </div>

        {/* Resolution Time */}
        <div className={styles.glass_card} style={{ "--delay": "0.4s" }}>
          <div className={styles.card_header}>
            <div className={styles.card_icon} style={{ background: "#14b8a6" }}>
              <span>🕒</span>
            </div>
            <h3 className={styles.card_title}>Resolution Time</h3>
          </div>
          <div className={styles.card_content}>
            <p>
              {incident.time_to_resolve ||
                "No resolution time information available"}
            </p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className={styles.glass_footer}>
        <div className={styles.footnote}>
          Tech Failures Museum • {new Date().getFullYear()}
        </div>
      </div>
    </div>
  );
};

export default GlassmorphicDetailsWindow;
