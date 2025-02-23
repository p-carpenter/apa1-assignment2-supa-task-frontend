"use client";

function IncidentPopup({ incident, onClose }) {
  return (
    <div className="absolute top-10 left-10 w-96 bg-win95gray border border-win95border p-4">
      <div className="flex justify-between bg-win95blue text-white px-2 py-1">
        <p>{incident.name}</p>
        <button onClick={onClose}>✖</button>
      </div>
      <div className="p-4">
        <p>Date: {incident.incident_date}</p>
        <p>Description: {incident.description}</p>
        <p>Category: {incident.category}</p>
        <p>Severity: {incident.severity}</p>
      </div>
    </div>
  );
}
