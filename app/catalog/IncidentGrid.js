import React from "react";
import Link from "next/link";
import styles from "./Catalog.module.css";
import { getSeverityIcon } from "@/app/utils/ui/severityIcons";
import { getCategoryIcon } from "@/app/utils/ui/categoryIcons";
import { generateSlug } from "@/app/utils/navigation/slugUtils";

const IncidentGrid = ({
  incidents = [],
  isLoading = false,
  onIncidentSelect,
  getIncidentYear,
  emptyMessage = "No incidents found.",
  selectionMode = false,
  selectedIncidents = [],
}) => {
  const renderLoadingSkeleton = () => {
    return Array(8)
      .fill(0)
      .map((_, index) => (
        <div key={`loading-${index}`} className={styles.loadingCard} />
      ));
  };

  const isSelected = (incident) => {
    return selectedIncidents.some((inc) => inc.id === incident.id);
  };

  const renderIncidents = () => {
    return incidents.map((incident) => {
      if (!incident) return null;

      const year = getIncidentYear(incident);

      const severity = incident.severity || "Unknown";
      const severityClass =
        severity === "Low"
          ? styles.severityLow
          : severity === "Moderate"
            ? styles.severityModerate
            : severity === "High" || severity === "Critical"
              ? styles.severityHigh
              : styles.severityUnknown;

      const SeverityIcon = getSeverityIcon(severity);
      const categoryIcon = incident.category
        ? getCategoryIcon(incident.category)
        : null;

      return (
        <Link
          href={
            selectionMode
              ? "#"
              : `/gallery?incident=${generateSlug(incident?.name ?? "Unknown Incident")}`
          }
          key={incident.id || "unknown"}
          className={`${styles.incidentItem} ${isSelected(incident) ? styles.selected : ""}`}
          onClick={(e) => onIncidentSelect(incident, e)}
        >
          <div className={styles.incidentYear}>
            {year} {selectionMode && <div className={styles.selectionCircle} />}
          </div>
          <div className={styles.incidentName}>{incident.name}</div>
          <div className={styles.incidentCategory}>
            <div className={styles.categoryName}>
              {categoryIcon} {incident.category}
            </div>
            {SeverityIcon && (
              <div className={`${styles.severityIcon} ${severityClass}`}>
                <SeverityIcon />
              </div>
            )}
          </div>
          <div className={styles.viewDetails}>View Details</div>
        </Link>
      );
    });
  };

  return (
    <div
      className={`${styles.incidentGrid} ${selectionMode ? styles.selectionMode : ""}`}
    >
      {isLoading ? (
        renderLoadingSkeleton()
      ) : incidents.length > 0 ? (
        renderIncidents()
      ) : (
        <div className={styles.emptyResults}>{emptyMessage}</div>
      )}
    </div>
  );
};

export default IncidentGrid;
