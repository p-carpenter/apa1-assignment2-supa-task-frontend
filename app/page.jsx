"use client";

import { useEffect, useState } from "react";
import ExplorerWindow from "@/app/components/core/ExplorerWindow";
import IncidentPopup from "@/app/components/core/IncidentPopup";
import ContextMenu from "@/app/components/core/ContextMenu";
import AddNewIncident from "./components/core/AddNewIncident";
import UpdateIncident from "./components/core/UpdateIncidentWindow";
import FullScreenViewer from "./components/core/FullScreenViewer";

export default function Home() {
  const [incidentData, setIncidentData] = useState([]);
  const [selectedIncidents, setSelectedIncidents] = useState([]);
  const [displayedIncident, setDisplayedIncident] = useState(null);
  const [currentIncidentIndex, setCurrentIncidentIndex] = useState(0);

  const [contextMenu, setContextMenu] = useState({
    visible: false,
    x: 0,
    y: 0,
    onFile: false, // if we clicked on an incident or empty space
    incidents: [], // the selected incidents at the time of right-click
  });

  // Show/hide windows
  const [showAddNew, setShowAddNew] = useState(false);
  const [showUpdate, setShowUpdate] = useState(false);

  // =======================================================================
  // 1. Load Incidents from DB
  // =======================================================================
  useEffect(() => {
    const fetchIncidents = async () => {
      try {
        const response = await fetch("/api/tech-incidents");
        if (!response.ok) throw new Error(`Error: ${response.status}`);
        const data = await response.json();
        setIncidentData(data);
      } catch (error) {
        console.error(error);
      }
    };
    fetchIncidents();
  }, []);

  // =======================================================================
  // 2. Handlers for Add / Update / Delete
  // =======================================================================

  const handleAddNewIncident = async (formData) => {
    try {
      const response = await fetch("/api/new-incident", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ addition: formData }),
      });
      if (!response.ok) throw new Error("Failed to create incident");
      const updatedData = await response.json();
      setIncidentData(updatedData);
      setShowAddNew(false);
    } catch (error) {
      console.error(error);
      return error.message;
    }
  };

  // Update (if only 1 item is selected or displayed)
  const handleUpdateIncident = async (formData) => {
    try {
      // We can update the currently displayed incident (if you double-clicked),
      // or if exactly one is selected in the Explorer
      const incidentToUpdate =
        displayedIncident ||
        (selectedIncidents.length === 1 ? selectedIncidents[0] : null);

      if (!incidentToUpdate) {
        throw new Error("No single incident to update");
      }

      const response = await fetch("/api/update-incident", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: incidentToUpdate.id,
          update: formData,
        }),
      });
      if (!response.ok) throw new Error("Failed to update incident");

      const updatedData = await response.json();
      setIncidentData(updatedData);
      setShowUpdate(false);
    } catch (error) {
      console.error(error);
      return error.message;
    }
  };

  const handleDeleteIncidents = async () => {
    if (!selectedIncidents.length) return;

    try {
      const idArray = selectedIncidents.map((inc) => inc.id);

      const response = await fetch("/api/delete-incident", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids: idArray }),
      });

      if (!response.ok) {
        throw new Error("Failed to delete incidents");
      }

      // Refresh
      const updatedData = await response.json();
      setIncidentData(updatedData);

      // Clear selection and close menu
      setSelectedIncidents([]);
      setContextMenu({ ...contextMenu, visible: false });
    } catch (error) {
      console.error(error);
      return error.message;
    }
  };

  // =======================================================================
  // 3. Context Menu
  // =======================================================================

  // Close the context menu (called whenever user left-clicks anywhere, etc.)
  const closeContextMenu = () => {
    setContextMenu({ ...contextMenu, visible: false });
  };

  // Update the handler for double-click
  const handleIncidentDoubleClick = (incident) => {
    const index = incidentData.findIndex((inc) => inc.id === incident.id);
    setCurrentIncidentIndex(index);
    setDisplayedIncident(incident);
  };

  const handleIncidentNavigation = (newIndex) => {
    setCurrentIncidentIndex(newIndex);
    setDisplayedIncident(incidentData[newIndex]);
  };

  // =======================================================================
  // 4. Render
  // =======================================================================
  return (
    <div
      className="flex items-center justify-center h-screen bg-[rgb(0,128,127)]"
      onClick={() => closeContextMenu()}
      onContextMenu={(e) => {
        e.preventDefault();
        closeContextMenu();
        setContextMenu({
          visible: true,
          x: e.clientX,
          y: e.clientY,
          onFile: false,
          incidents: [],
        });
      }}
      style={{ position: "relative" }}
    >
      <ExplorerWindow
        incidents={incidentData}
        selectedIncidents={selectedIncidents}
        setSelectedIncidents={setSelectedIncidents}
        setDisplayedIncident={setDisplayedIncident} // for double-click to open popup
        setContextMenu={setContextMenu} // so ExplorerWindow can open context menu
      />

      {/* If the user double-clicked on a single incident, show popup */}
      {displayedIncident && (
        <FullScreenViewer
          incident={displayedIncident}
          incidents={incidentData}
          currentIndex={currentIncidentIndex}
          onClose={() => setDisplayedIncident(null)}
          onNavigate={handleIncidentNavigation}
        />
      )}

      {/* Context Menu */}
      {contextMenu.visible && (
        <ContextMenu
          visible={contextMenu.visible}
          x={contextMenu.x}
          y={contextMenu.y}
          onFile={contextMenu.onFile}
          incidents={contextMenu.incidents}
          closeContextMenu={closeContextMenu}
          setShowAddNew={setShowAddNew}
          setShowUpdate={setShowUpdate}
          onDeleteIncidents={handleDeleteIncidents}
        />
      )}

      {/* Add New Incident Window */}
      {showAddNew && (
        <AddNewIncident
          onClose={() => setShowAddNew(false)}
          onSubmit={handleAddNewIncident}
        />
      )}

      {/* Update Incident Window */}
      {showUpdate && (
        <UpdateIncident
          incident={
            selectedIncidents.length === 1 ? selectedIncidents[0] : null
          }
          onClose={() => setShowUpdate(false)}
          onSubmit={handleUpdateIncident}
        />
      )}
    </div>
  );
}
