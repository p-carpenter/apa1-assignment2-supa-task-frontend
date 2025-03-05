"use client";

import { useState } from "react";
import { useIncidents } from "./contexts/IncidentContext";
import useIncidentFilter from "./hooks/useIncidentFilter";
import useViewManager from "./hooks/useViewManager";
import IncidentCatalog from "@/app/catalog-old/page";
import ContextMenu from "@/app/components/common/ContextMenu";
import AddNewIncident from "./components/features/forms/AddNewIncident";
import UpdateIncident from "./components/features/forms/UpdateIncidentWindow";
import IncidentGallery from "./gallery/page";
import Homepage from "./components/features/homepage/Homepage";

export default function Home() {
  const {
    incidents,
    setIncidents,
    selectedIncidents,
    setSelectedIncidents,
    displayedIncident,
  } = useIncidents();

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
  // Handlers for Add / Update / Delete
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
      setIncidents(updatedData);
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
      setIncidents(updatedData);
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
      setIncidents(updatedData);

      // Clear selection and close menu
      setSelectedIncidents([]);
      setContextMenu({ ...contextMenu, visible: false });
    } catch (error) {
      console.error(error);
      return error.message;
    }
  };

  // =======================================================================
  // Context Menu
  // =======================================================================

  // Close the context menu (called whenever user left-clicks anywhere, etc.)
  const closeContextMenu = () => {
    setContextMenu({ ...contextMenu, visible: false });
  };

  // Get filtered incidents
  const { filteredIncidents } = useIncidentFilter(incidents);

  // Use our view manager with the filtered incidents
  useViewManager(filteredIncidents);

  // =======================================================================
  // Render
  // =======================================================================
  return (
    // <div
    //   className="flex items-center justify-center h-screen bg-[rgb(0,128,127)]"
    //   onClick={() => closeContextMenu()}
    //   onContextMenu={(e) => {
    //     e.preventDefault();
    //     closeContextMenu();
    //     setContextMenu({
    //       visible: true,
    //       x: e.clientX,
    //       y: e.clientY,
    //       onFile: false,
    //       incidents: [],
    //     });
    //   }}
    //   style={{ position: "relative" }}
    // >
    //   <IncidentCatalog
    //     setContextMenu={setContextMenu}
    //     setShowAddNew={setShowAddNew}
    //     setShowUpdate={setShowUpdate}
    //   />

    //   <IncidentGallery />

    //   {/* Context Menu */}
    //   {contextMenu.visible && (
    //     <ContextMenu
    //       visible={contextMenu.visible}
    //       x={contextMenu.x}
    //       y={contextMenu.y}
    //       onFile={contextMenu.onFile}
    //       incidents={contextMenu.incidents}
    //       closeContextMenu={closeContextMenu}
    //       setShowAddNew={setShowAddNew}
    //       setShowUpdate={setShowUpdate}
    //       onDeleteIncidents={handleDeleteIncidents}
    //     />
    //   )}

    //   {/* Add New Incident Window */}
    //   {showAddNew && (
    //     <AddNewIncident
    //       onClose={() => setShowAddNew(false)}
    //       onSubmit={handleAddNewIncident}
    //     />
    //   )}

    //   {/* Update Incident Window */}
    //   {showUpdate && (
    //     <UpdateIncident
    //       incident={
    //         selectedIncidents.length === 1 ? selectedIncidents[0] : null
    //       }
    //       onClose={() => setShowUpdate(false)}
    //       onSubmit={handleUpdateIncident}
    //     />
    //   )}
    <div>
      <Homepage />
    </div>
  );
}
