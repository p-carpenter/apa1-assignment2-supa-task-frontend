"use client";

import { useIncidents } from "../../../contexts/IncidentContext";
import useSelectionManager from "../../../hooks/useSelectionManager";
import useIncidentFilter from "../../../hooks/useIncidentFilter";
import useViewManager from "../../../hooks/useViewManager";
import MenuBar from "../../ui/win95/MenuBar";
import AddressBar from "../../ui/win95/AddressBar";
import WindowContainer from "../../ui/win95/Win95WindowContainer";
import TitleBar from "../../ui/win95/Win95TitleBar";
import FilterBar from "../../ui/win95/FilterBar";
import SelectionBox from "../../ui/win95/SelectionBox";
import CatalogItem from "../../ui/win95/CatalogItem";
import { useEffect } from "react";

const IncidentCatalog = ({ setContextMenu, setShowAddNew, setShowUpdate }) => {
  const {
    incidents,
    incidentsByDecade,
    selectedIncidents,
    setSelectedIncidents,
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
    handleIncidentClick,
    navigateToRoot,
    currentPath,
    windowTitle,
  } = useViewManager(incidents, incidentsByDecade, filteredIncidents);

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
                incidentCount: incidentsByDecade[decade]?.length || 0,
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
            <CatalogItem
              key={incident.id || index}
              type="incident"
              item={incident}
              index={index}
              isSelected={selectedIncidents.includes(incident)}
              onClick={(e) =>
                handleItemSelect(e, incident, index, visibleIncidents)
              }
              onDoubleClick={() => handleIncidentClick(incident)}
              onContextMenu={(e) => handleContextMenu(e, incident, index)}
            />
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
