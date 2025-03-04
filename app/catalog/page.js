"use client";

import { useIncidents } from "../contexts/IncidentContext";
import useSelectionManager from "../hooks/useSelectionManager";
import useIncidentFilter from "../hooks/useIncidentFilter";
import useViewManager from "../hooks/useViewManager";
import MenuBar from "../components/ui/win95/MenuBar";
import AddressBar from "../components/ui/win95/AddressBar";
import WindowContainer from "../components/ui/win95/Win95WindowContainer";
import TitleBar from "../components/ui/win95/Win95TitleBar";
import FilterBar from "../components/ui/win95/FilterBar";
import SelectionBox from "../components/ui/win95/SelectionBox";
import CatalogItem from "../components/ui/win95/CatalogItem";
import Link from "next/link";
import { useEffect } from "react";
import { generateSlug } from "@/app/utils/slugUtils";
import { useSearchParams } from "next/navigation";

const IncidentCatalog = ({ setContextMenu, setShowAddNew, setShowUpdate }) => {
  const {
    incidents,
    incidentsByDecade,
    selectedIncidents,
    setSelectedIncidents,
    setDisplayedIncident,
    setCurrentIncidentIndex,
    filteredIncidents: contextFilteredIncidents,
  } = useIncidents();

  const {
    activeFilter,
    searchQuery,
    filteredIncidents,
    handleFilterClick,
    handleSearchChange,
  } = useIncidentFilter(incidents);

  const {
    currentView,
    filteredDecades,
    visibleIncidents,
    handleFolderDoubleClick,
    navigateToRoot,
    currentPath,
    windowTitle,
  } = useViewManager(filteredIncidents);

  const searchParams = useSearchParams();
  const resetView = searchParams.get("reset");

  // Reset to root view if coming from gallery with reset parameter
  useEffect(() => {
    if (resetView === "true") {
      navigateToRoot();

      // Optionally remove the query parameter from URL without navigation
      const url = window.location.pathname;
      window.history.replaceState({ path: url }, "", url);
    }
  }, [resetView, navigateToRoot]);

  const {
    containerRef,
    isSelecting,
    selectionBox,
    handleItemSelect,
    handleItemContextMenu,
    handleMouseDown,
    handleMouseMove,
    handleMouseUp,
  } = useSelectionManager(setSelectedIncidents);

  const items = currentView === "years" ? filteredDecades : visibleIncidents;

  const handleContextMenu = (e, item, index) => {
    const menuInfo = handleItemContextMenu(e, item, index, selectedIncidents);
    setContextMenu(menuInfo);
  };

  const handleViewIncidentInGallery = (incident) => {
    const index = incidents.findIndex((inc) => inc.id === incident.id);
    setCurrentIncidentIndex(index);
    setDisplayedIncident(incident);
  };

  return (
    <WindowContainer
      onMouseDown={handleMouseDown}
      onMouseMove={(e) => handleMouseMove(e, items, currentView)}
      onMouseUp={handleMouseUp}
      onContextMenu={(e) => {
        e.preventDefault();
        setContextMenu({
          visible: true,
          x: e.clientX,
          y: e.clientY,
          onFile: false,
          incidents: [],
        });
      }}
    >
      <TitleBar
        title={windowTitle}
        icon="/win95-folder-icon.png"
        onMinimize={() => {}}
        onMaximize={() => {}}
        onClose={() => {}}
      />
      <MenuBar />
      <AddressBar
        currentPath={currentPath}
        searchQuery={searchQuery}
        onSearchChange={handleSearchChange}
        onSearchSubmit={(e) => e.preventDefault()}
      />

      <FilterBar
        currentView={currentView}
        categories={[
          ...new Set(incidents.map((incident) => incident.category)),
        ]}
        activeFilter={activeFilter}
        onFilterClick={handleFilterClick}
        onBackClick={navigateToRoot}
      />

      <div className="explorer-content" ref={containerRef}>
        {currentView === "years" ? (
          filteredDecades.map((decade, index) => (
            <CatalogItem
              key={decade}
              type="folder"
              item={{
                name: `${decade}s`,
                value: decade,
                incidentCount:
                  incidentsByDecade[decade]?.filter((inc) =>
                    filteredIncidents.includes(inc)
                  ).length || 0,
              }}
              index={index}
              isSelected={selectedIncidents.includes(decade)}
              onClick={(e) =>
                handleItemSelect(e, decade, index, filteredDecades)
              }
              onDoubleClick={() => handleFolderDoubleClick(decade)}
              onContextMenu={(e) => handleContextMenu(e, decade, index)}
            />
          ))
        ) : visibleIncidents.length > 0 ? (
          visibleIncidents.map((incident, index) => (
            <Link
              href={`/gallery?incident=${generateSlug(incident.name)}`}
              key={incident.id || index}
              onClick={() => {
                setDisplayedIncident(incident);
                const incidentIndex = incidents.findIndex(
                  (inc) => inc.id === incident.id
                );
                setCurrentIncidentIndex(incidentIndex >= 0 ? incidentIndex : 0);
              }}
              style={{ textDecoration: "none", color: "inherit" }}
            >
              <CatalogItem
                type="incident"
                item={incident}
                index={index}
                isSelected={selectedIncidents.includes(incident)}
                onClick={(e) =>
                  handleItemSelect(e, incident, index, visibleIncidents)
                }
                onContextMenu={(e) => handleContextMenu(e, incident, index)}
              />
            </Link>
          ))
        ) : (
          <div className="text-center my-8 w-full">
            <p>No incidents match your search criteria.</p>
          </div>
        )}
      </div>

      <SelectionBox isSelecting={isSelecting} selectionBox={selectionBox} />
    </WindowContainer>
  );
};

export default IncidentCatalog;
