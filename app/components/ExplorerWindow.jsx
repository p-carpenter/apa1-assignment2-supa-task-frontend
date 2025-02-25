"use client";
import { useEffect, useRef, useState } from "react";
import MenuBar from "./catalog/MenuBar";
import AddressBar from "./catalog/AddressBar";
import WindowContainer from "./core/WindowContainer";
import TitleBar from "./core/TitleBar";
import FilterBar from "./catalog/FilterBar";
import IncidentCard from "./catalog/IncidentCard";
import YearFolder from "./catalog/YearFolder";
import SelectionBox from "./catalog/SelectionBox";
import useIncidentProcessor from "../hooks/useIncidentProcessor";
import useIncidentFilter from "../hooks/useIncidentFilter";
import useViewManager from "../hooks/useViewManager";
import useSelectionManager from "../hooks/useSelectionManager";

const ExplorerWindow = ({
  incidents,
  selectedIncidents,
  setSelectedIncidents,
  setDisplayedIncident,
  setContextMenu,
}) => {
  const { incidentsByDecade, decades } = useIncidentProcessor(incidents);

  const {
    activeFilter,
    searchQuery,
    filteredIncidents,
    handleFilterClick,
    handleSearchChange,
    handleSearchClear,
  } = useIncidentFilter(incidents);

  const {
    currentView,
    currentYear,
    setCurrentView,
    setCurrentYear,
    filteredDecades,
    visibleIncidents,
    navigateToYear,
    navigateToRoot,
    currentPath,
    windowTitle,
  } = useViewManager(incidents, incidentsByDecade, filteredIncidents);

  const {
    containerRef,
    isSelecting,
    selectionBox,
    handleItemClick,
    handleItemContextMenu,
    handleMouseDown,
    handleMouseMove,
    handleMouseUp,
  } = useSelectionManager(setSelectedIncidents);

  const handleItemDoubleClick = (incident) => {
    setDisplayedIncident(incident);
  };

  const handleFolderDoubleClick = (decade) => {
    navigateToYear(decade);
    setSelectedIncidents([]);
  };

  const handleBackClick = () => {
    navigateToRoot();
    setSelectedIncidents([]);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
  };

  return (
    <WindowContainer
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
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
        onMinimize={() => {
          /* handle minimize */
        }}
        onMaximize={() => {
          /* handle maximize */
        }}
        onClose={() => {
          /* handle close */
        }}
      />
      <MenuBar />
      <AddressBar
        currentPath={currentPath}
        searchQuery={searchQuery}
        onSearchChange={handleSearchChange}
        onSearchSubmit={(e) => e.key === "Enter" && handleSearchSubmit(e)}
      />

      <FilterBar
        currentView={currentView}
        categories={[
          ...new Set(incidents.map((incident) => incident.category)),
        ]}
        activeFilter={activeFilter}
        onFilterClick={handleFilterClick}
        onBackClick={handleBackClick}
      />

      <div className="explorer-content" ref={containerRef}>
        {currentView === "years" ? (
          filteredDecades.map((decade, index) => (
            <YearFolder
              key={decade}
              year={`${decade}s`}
              incidentCount={incidentsByDecade[decade]?.length || 0}
              index={index}
              onDoubleClick={() => handleFolderDoubleClick(decade)}
            />
          ))
        ) : visibleIncidents.length > 0 ? (
          visibleIncidents.map((entry, index) => {
            const isSelected = selectedIncidents.includes(entry);
            return (
              <IncidentCard
                key={entry.id || index}
                entry={entry}
                index={index}
                isSelected={isSelected}
                onClick={(e) => handleItemClick(e, entry, index)}
                onDoubleClick={() => handleItemDoubleClick(entry)}
                onContextMenu={(e) => handleItemContextMenu(e, entry, index)}
              />
            );
          })
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

export default ExplorerWindow;
