"use client";
import { useRef, useState, useEffect } from "react";

export default function ExplorerWindow({
  incidents,
  selectedIncidents,
  setSelectedIncidents,
  setDisplayedIncident,
  setContextMenu,
}) {
  // For SHIFT-click we track the last clicked index
  const [lastClickedIndex, setLastClickedIndex] = useState(null);

  // For drag selection
  const containerRef = useRef(null);
  const [isSelecting, setIsSelecting] = useState(false);
  const [startPoint, setStartPoint] = useState({ x: 0, y: 0 });
  const [selectionBox, setSelectionBox] = useState({ x: 0, y: 0, width: 0, height: 0 });

  // 1) Handle normal clicks (Shift, Ctrl, etc.)
  const handleItemClick = (e, incident, index) => {
    e.stopPropagation();
    // If SHIFT => select range
    if (e.shiftKey && lastClickedIndex !== null) {
      const start = Math.min(lastClickedIndex, index);
      const end = Math.max(lastClickedIndex, index);
      const range = incidents.slice(start, end + 1);
      setSelectedIncidents(range);
    }
    // If CTRL/META => toggle
    else if (e.ctrlKey || e.metaKey) {
      if (selectedIncidents.includes(incident)) {
        setSelectedIncidents(selectedIncidents.filter((i) => i !== incident));
      } else {
        setSelectedIncidents([...selectedIncidents, incident]);
      }
      setLastClickedIndex(index);
    }
    // Otherwise => single select
    else {
      setSelectedIncidents([incident]);
      setLastClickedIndex(index);
    }
  };

  // 2) Double click => open popup
  const handleItemDoubleClick = (incident) => {
    setDisplayedIncident(incident);
  };

  // 3) Right click => open context menu
  const handleItemContextMenu = (e, incident, index) => {
    e.preventDefault();
    e.stopPropagation();

    // If item isn't in selection, select it alone
    if (!selectedIncidents.includes(incident)) {
      setSelectedIncidents([incident]);
      setLastClickedIndex(index);
    }

    // Show context menu
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

  // 4) Start drag selection if user clicked on empty space
  //    We'll do this onMouseDown of the container.
  //    If user clicks an item, it’s handled in handleItemClick above,
  //    so we can skip setting isSelecting in that scenario.
  const handleMouseDown = (e) => {
    // Only left-click, and only if not holding SHIFT/CTRL:
    if (e.button !== 0 || e.shiftKey || e.ctrlKey || e.metaKey) return;

    // Check if the click was on the container (not an item).
    // Because items do e.stopPropagation(), a click on an item
    // won't bubble here. So if we get here, it's empty space.
    setIsSelecting(true);
    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    setStartPoint({ x, y });
    setSelectionBox({ x, y, width: 0, height: 0 });

    // Clear existing selection if you want to start fresh:
    setSelectedIncidents([]);
  };

  // 5) On mouse move, update selectionBox
  const handleMouseMove = (e) => {
    if (!isSelecting) return;
    e.preventDefault(); // prevent text highlight

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

    // Real-time highlight: find all items that intersect newBox
    const newlySelected = [];
    for (let i = 0; i < incidents.length; i++) {
      const itemEl = document.getElementById(`incident-${i}`);
      if (!itemEl) continue;
      const itemRect = itemEl.getBoundingClientRect();

      // Convert itemRect to container coords:
      const itemBox = {
        x: itemRect.left - rect.left,
        y: itemRect.top - rect.top,
        width: itemRect.width,
        height: itemRect.height,
      };

      if (boxesIntersect(newBox, itemBox)) {
        newlySelected.push(incidents[i]);
      }
    }
    setSelectedIncidents(newlySelected);
  };

  // 6) On mouse up, finalize selection
  const handleMouseUp = (e) => {
    if (e.button !== 0) return; // only left button
    setIsSelecting(false);
  };

  // 7) A helper function to detect bounding-box intersections
  function boxesIntersect(a, b) {
    return !(
      a.x + a.width < b.x ||
      a.x > b.x + b.width ||
      a.y + a.height < b.y ||
      a.y > b.y + b.height
    );
  }

    const [activeFilter, setActiveFilter] = useState(null);

    const handleFilterClick = (category) => {
    if (activeFilter === category) {
      setActiveFilter(null);
    } else {
      setActiveFilter(category);
    }
  };

  const filteredIncidents = activeFilter 
    ? incidents.filter(incident => incident.category === activeFilter)
    : incidents;

  return (
    <div
      ref={containerRef}
      className="explorer-container h-[80vh] w-[75vw] shadow-win95"
      style={{ 
        userSelect: "none", 
        position: "relative"
      }}
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
            {/* Window Bar */}
      <div className="explorer-window-bar">
        <div className="folder-name">
          <img src="/win95-folder-icon.png" alt="Folder Icon" />
          <p>Technology Failures</p>
        </div>
        <div className="window-buttons">
          <div id="min-button"></div>
          <div id="max-button"></div>
          <div id="close-button"></div>
        </div>
      </div>

      {/* Explorer Header */}
      <div className="explorer-header">
        <div className="menu">
          <p>File</p>
          <p>Edit</p>
          <p>View</p>
          <p>Help</p>
        </div>
        <div className="path-display">
          <p>Address</p>
          <p className="explorer-path">C:\Technology Failures</p>
          <div className="action-icons">
            <img src="/search.png" />
          </div>
        </div>
      </div>
      <div className="filter-bar">
        <input type="text" placeholder="Search..." />
        <button>Search</button>
        <div className="flex flex-row gap-3 items-center justify-start">
            <p>Category:</p> 
            {[...new Set(incidents.map(incident => incident.category))].map(category => (
            <button 
              key={category} 
              className={`filter-button ${activeFilter === category ? 'bg-win95blue text-white' : 'hover:bg-win95blue hover:text-white'}`}
              onClick={() => handleFilterClick(category)}
            >
              {category}
            </button>
          ))}
      </div>
      </div>

      <div className="explorer-content">
        {filteredIncidents.map((entry, index) => {
        const isSelected = selectedIncidents.includes(entry);
          return (
            <div
              key={entry.id}
              id={`incident-${index}`}
              className={`case-container ${isSelected ? "selected" : ""}`}
              style={{ position: "relative" }}
              onClick={(e) => handleItemClick(e, entry, index)}
              onDoubleClick={() => handleItemDoubleClick(entry)}
              onContextMenu={(e) => handleItemContextMenu(e, entry, index)}
            >
              <div className="casefile">
                <img src="/computer.png" className="w-12 h-12" />
                <div
                  className={`absolute bottom-0 right-0 w-3 h-3 rounded-full ${entry.severity.toLowerCase()}`}
                />
              </div>
              <p>{entry.name}</p>
              <p className="text-xs bg-gray-300 px-2 category-label">
                {entry.category}
              </p>
            </div>
          );
        })}
      </div>

      {/* Show the selection box overlay if isSelecting */}
      {isSelecting && (
        <div
          style={{
            position: "absolute",
            border: "1px dashed black",
            background: "transparent",
            left: selectionBox.x,
            top: selectionBox.y,
            width: selectionBox.width,
            height: selectionBox.height,
            pointerEvents: "none",
          }}
        />
      )}
    </div>
  );
}
