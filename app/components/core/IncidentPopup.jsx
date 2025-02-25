"use client";

export default function IncidentPopup({ incident, onClose }) {
  return (
    <div className="incident-window-container">
      <div className="explorer-window-bar">
        <div className="folder-name">
          <p>{incident.name}</p>
        </div>
        <div className="window-buttons">
          <div id="close-button"></div>
          <div id="max-button"></div>
        </div>
      </div>
      <div className="incident-content-container">
        <div className="p-4">
          <p>Date: {incident.incident_date}</p>
          <p>Description: {incident.description}</p>
          <p>Category: {incident.category}</p>
          <p>Severity: {incident.severity}</p>
        </div>
        <div className="popup-button-container">
          <button className="popup-button">Try to fix</button>
          <button className="popup-button" onClick={() => onClose()}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
