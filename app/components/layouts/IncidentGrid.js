import React from "react";
import Link from "next/link";
import { generateSlug } from "../../utils/navigation/slugUtils";
import { getCategoryIcon } from "../../utils/ui/categoryIcons";
import { getSeverityIcon } from "../../utils/ui/severityIcons";

const IncidentGrid = ({
  incidents = [],
  isLoading = false,
  emptyMessage = "No matching incidents found.",
  onIncidentSelect,
  getIncidentYear,
  selectionMode = false,
  selectedIncidents = [],
}) => {
  if (isLoading) {
    return (
      <div className="incident-grid">
        {[...Array(8)].map((_, i) => (
          <div key={i} className="loading-card"></div>
        ))}
      </div>
    );
  }

  if (incidents.length === 0) {
    return (
      <div className="empty-results">
        <div className="output-text blink-once">Error: {emptyMessage}</div>
        <div className="output-text">
          Try adjusting search parameters or filters.
        </div>
      </div>
    );
  }

  return (
    <div className={`incident-grid ${selectionMode ? 'selection-mode' : ''}`}>
      {incidents.map((incident) => {
        const year = getIncidentYear(incident);
        const isSelected = selectedIncidents.some(inc => inc.id === incident.id);

        return (
          <Link
            key={incident.id || `incident-${incident.name || "unknown"}`}
            href={`/gallery?incident=${generateSlug(incident.name || "Unknown Incident")}`}
            onClick={(e) => onIncidentSelect && onIncidentSelect(incident, e)}
            className={`incident-item ${isSelected ? 'selected' : ''}`}
            data-testid="incident-item"
          >
            {selectionMode && (
              <div className="selection-circle"></div>
            )}
            <div className="incident-year">{year || "Unknown Year"}</div>
            <div className="incident-name">
              {incident.name || "Unknown Incident"}
            </div>
            <div className="incident-category">
              <div className="category-name">
                {getCategoryIcon(incident.category)} {incident.category || "Uncategorized"}
              </div>
              {getSeverityIcon(incident.severity)}
            </div>
            <div className="view-details">
              {selectionMode ? 'Select' : 'View Details'}
            </div>
          </Link>
        );
      })}
    </div>
  );
};

export default IncidentGrid;