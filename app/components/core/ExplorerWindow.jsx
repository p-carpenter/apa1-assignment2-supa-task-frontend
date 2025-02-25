"use client";

import MenuBar from "../catalog/MenuBar";
import AddressBar from "../catalog/AddressBar";
import WindowContainer from "../common/WindowContainer";
import TitleBar from "../common/TitleBar";
import FilterBar from "../catalog/FilterBar";
import SelectionBox from "../catalog/SelectionBox";
import useIncidentProcessor from "../../hooks/useIncidentProcessor";
import useIncidentFilter from "../../hooks/useIncidentFilter";
import useViewManager from "../../hooks/useViewManager";
import useSelectionManager from "../../hooks/useSelectionManager";
import CatalogItem from "../catalog/CatalogItem";

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

  const handleContextMenu = (e, item, index) => {
    const menuInfo = handleItemContextMenu(e, item, index, selectedIncidents);
    setContextMenu(menuInfo);
  };

  // Get the correct items based on current view
  const items = currentView === "years" ? decades : visibleIncidents;

  return (
    <WindowContainer
      onMouseDown={handleMouseDown}
      onMouseMove={(e) => handleMouseMove(e, items, currentView)}
      onMouseUp={handleMouseUp}
      onContextMenu={(e) => {
        e.preventDefault();
        const menuInfo = {
          visible: true,
          x: e.clientX,
          y: e.clientY,
          onFile: false,
          incidents: [],
        };
        setContextMenu(menuInfo);
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
                handleItemClick(e, decade, index, filteredDecades)
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
                handleItemClick(e, incident, index, visibleIncidents)
              }
              onDoubleClick={() => handleItemDoubleClick(incident)}
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

export default ExplorerWindow;
