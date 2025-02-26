"use client";

import { useEffect, useState } from "react";
import { ThemeProvider } from "./contexts/ThemeContext";
import { IncidentProvider } from "./contexts/IncidentContext";
import useIncidentProcessor from "./hooks/useIncidentProcessor";
import useIncidentFilter from "./hooks/useIncidentFilter";
import useViewManager from "./hooks/useViewManager";
import ExplorerWindow from "@/app/components/core/ExplorerWindow";
import ContextMenu from "@/app/components/core/ContextMenu";
import AddNewIncident from "./components/core/AddNewIncident";
import UpdateIncident from "./components/core/UpdateIncidentWindow";
import FullScreenViewer from "./components/core/FullScreenViewer";

export default function Home() {
  const [incidentData, setIncidentData] = useState([]);
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

  // Move view management logic to root
  const { incidentsByDecade } = useIncidentProcessor(incidentData);

  const { filteredIncidents } = useIncidentFilter(incidentData);

  const { currentDecade } = useViewManager(
    incidentData,
    incidentsByDecade,
    filteredIncidents
  );

  // =======================================================================
  // 4. Render
  // =======================================================================
  return (
    <IncidentProvider incidents={incidentData} currentDecade={currentDecade}>
      <ThemeProvider>
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
            setContextMenu={setContextMenu}
            setShowAddNew={setShowAddNew}
            setShowUpdate={setShowUpdate}
          />

          <FullScreenViewer />

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
      </ThemeProvider>
    </IncidentProvider>
  );
}
