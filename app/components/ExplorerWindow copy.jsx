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

export default function ExplorerWindow2({
  incidents,
  selectedIncidents,
  setSelectedIncidents,
  setDisplayedIncident,
  setContextMenu,
}) {
  const [lastClickedIndex, setLastClickedIndex] = useState(null);
  const containerRef = useRef(null);
  const [isSelecting, setIsSelecting] = useState(false);
  const [startPoint, setStartPoint] = useState({ x: 0, y: 0 });
  const [selectionBox, setSelectionBox] = useState({
    x: 0,
    y: 0,
    width: 0,
    height: 0,
  });

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

  const handleItemClick = (e, incident, index) => {
    e.stopPropagation();
    if (e.shiftKey && lastClickedIndex !== null) {
      const start = Math.min(lastClickedIndex, index);
      const end = Math.max(lastClickedIndex, index);
      const range = incidents.slice(start, end + 1);
      setSelectedIncidents(range);
    } else if (e.ctrlKey || e.metaKey) {
      if (selectedIncidents.includes(incident)) {
        setSelectedIncidents(selectedIncidents.filter((i) => i !== incident));
      } else {
        setSelectedIncidents([...selectedIncidents, incident]);
      }
      setLastClickedIndex(index);
    } else {
      setSelectedIncidents([incident]);
      setLastClickedIndex(index);
    }
  };

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

  const handleItemContextMenu = (e, incident, index) => {
    e.preventDefault();
    e.stopPropagation();

    if (!selectedIncidents.includes(incident)) {
      setSelectedIncidents([incident]);
      setLastClickedIndex(index);
    }

    setContextMenu({
      visible: true,
      x: e.clientX,
      y: e.clientY,
      onFile: true,
      incidents: selectedIncidents.includes(incident)
        ? selectedIncidents
        : [incident],
    });
  };

  const handleMouseDown = (e) => {
    if (e.button !== 0 || e.shiftKey || e.ctrlKey || e.metaKey) return;

    setIsSelecting(true);
    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    setStartPoint({ x, y });
    setSelectionBox({ x, y, width: 0, height: 0 });

    setSelectedIncidents([]);
  };

  const handleMouseMove = (e) => {
    if (!isSelecting) return;
    e.preventDefault();

    const rect = containerRef.current.getBoundingClientRect();
    const currentX = e.clientX - rect.left;
    const currentY = e.clientY - rect.top;

    const newBox = {
      x: Math.min(startPoint.x, currentX),
      y: Math.min(startPoint.y, currentY),
      width: Math.abs(currentX - startPoint.x),
      height: Math.abs(currentY - startPoint.y),
    };
    setSelectionBox(newBox);

    const newlySelected = [];
    const items = currentView === "years" ? filteredDecades : visibleIncidents;

    for (let i = 0; i < items.length; i++) {
      const itemEl = document.getElementById(
        `${currentView === "years" ? "folder" : "incident"}-${i}`
      );
      if (!itemEl) continue;
      const itemRect = itemEl.getBoundingClientRect();

      const itemBox = {
        x: itemRect.left - rect.left,
        y: itemRect.top - rect.top,
        width: itemRect.width,
        height: itemRect.height,
      };

      if (boxesIntersect(newBox, itemBox)) {
        newlySelected.push(items[i]);
      }
    }
    setSelectedIncidents(newlySelected);
  };

  const handleMouseUp = (e) => {
    if (e.button !== 0) return;
    setIsSelecting(false);
  };

  function boxesIntersect(a, b) {
    return !(
      a.x + a.width < b.x ||
      a.x > b.x + b.width ||
      a.y + a.height < b.y ||
      a.y > b.y + b.height
    );
  }

  const handleSearchSubmit = (e) => {
    e.preventDefault();
  };

  return (
    <WindowContainer
      ref={containerRef}
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

      <div className="explorer-content">
        {currentView === "years" ? (
          filteredDecades.map((decade, index) => (
            <YearFolder
              key={decade}
              year={`${decade}s`} // Add 's' to show it's a decade
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
}
