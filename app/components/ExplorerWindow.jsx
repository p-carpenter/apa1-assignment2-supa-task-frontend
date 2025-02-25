"use client";
import { useRef, useState, useEffect } from "react";

export default function ExplorerWindow({
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
  const [selectionBox, setSelectionBox] = useState({ x: 0, y: 0, width: 0, height: 0 });

  const [currentView, setCurrentView] = useState('years');
  const [currentYear, setCurrentYear] = useState(null);
  
  const incidentsByYear = incidents.reduce((acc, incident) => {
    const year = new Date(incident.incident_date).getFullYear();
    if (!acc[year]) {
      acc[year] = [];
    }
    acc[year].push(incident);
    return acc;
  }, {});
  
  const years = Object.keys(incidentsByYear).sort();

  const handleItemClick = (e, incident, index) => {
    e.stopPropagation();
    if (e.shiftKey && lastClickedIndex !== null) {
      const start = Math.min(lastClickedIndex, index);
      const end = Math.max(lastClickedIndex, index);
      const range = incidents.slice(start, end + 1);
      setSelectedIncidents(range);
    }
    else if (e.ctrlKey || e.metaKey) {
      if (selectedIncidents.includes(incident)) {
        setSelectedIncidents(selectedIncidents.filter((i) => i !== incident));
      } else {
        setSelectedIncidents([...selectedIncidents, incident]);
      }
      setLastClickedIndex(index);
    }
    else {
      setSelectedIncidents([incident]);
      setLastClickedIndex(index);
    }
  };

  const handleItemDoubleClick = (incident) => {
    setDisplayedIncident(incident);
  };
  
  const handleFolderDoubleClick = (year) => {
    setCurrentView('incidents');
    setCurrentYear(year);
    setSelectedIncidents([]);
  };
  
  const handleBackClick = () => {
    setCurrentView('years');
    setCurrentYear(null);
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
    const items = currentView === 'years' ? years : incidentsByYear[currentYear];
    
    for (let i = 0; i < items.length; i++) {
      const itemEl = document.getElementById(`${currentView === 'years' ? 'folder' : 'incident'}-${i}`);
      if (!itemEl) continue;
      const itemRect = itemEl.getBoundingClientRect();

      const itemBox = {
        x: itemRect.left - rect.left,
        y: itemRect.top - rect.top,
        width: itemRect.width,
        height: itemRect.height,
      };

      if (boxesIntersect(newBox, itemBox)) {
        if (currentView === 'years') {
          newlySelected.push(years[i]);
        } else {
          newlySelected.push(incidentsByYear[currentYear][i]);
        }
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

  const [activeFilter, setActiveFilter] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");

  const handleFilterClick = (category) => {
    if (activeFilter === category) {
      setActiveFilter(null);
    } else {
      setActiveFilter(category);
    }
  };

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
  };

  const filteredIncidents = incidents.filter(incident => {
    if (activeFilter && incident.category !== activeFilter) {
      return false;
    }
    
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      return (
        incident.name.toLowerCase().includes(query) ||
        incident.category.toLowerCase().includes(query) ||
        (incident.severity && incident.severity.toLowerCase().includes(query))
      );
    }
    
    return true;
  });
  
  const filteredYears = searchQuery || activeFilter 
    ? years.filter(year => {
        return incidentsByYear[year].some(incident => 
          filteredIncidents.includes(incident)
        );
      })
    : years;
  
  const visibleIncidents = currentYear
    ? incidentsByYear[currentYear].filter(incident => filteredIncidents.includes(incident))
    : [];

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
      <div className="explorer-window-bar">
        <div className="folder-name">
          <img src="/win95-folder-icon.png" alt="Folder Icon" />
          <p>Technology Incidents{currentYear ? ` - ${currentYear}` : ''}</p>
        </div>
        <div className="window-buttons">
          <div id="min-button"></div>
          <div id="max-button"></div>
          <div id="close-button"></div>
        </div>
      </div>

      <div className="explorer-header">
        <div className="menu">
          <p>File</p>
          <p>Edit</p>
          <p>View</p>
          <p>Help</p>
        </div>
        <div className="path-display">
          <p>Address</p>
          <div className="explorer-path flex-1 flex items-center">
            <p className="whitespace-nowrap">C:\Technology Incidents{currentYear ? `\\${currentYear}` : ''}\</p>
            <input 
              type="text" 
              className="flex-1 outline-none border-none bg-transparent"
              placeholder="Search..." 
              value={searchQuery}
              onChange={handleSearchChange}
              onKeyDown={(e) => e.key === 'Enter' && handleSearchSubmit(e)}
            />
          </div>
        </div>
      </div>
      <div className="filter-bar">
        <div className="flex flex-row gap-3 items-center justify-start">
            {currentView === 'incidents' && (
              <button className="win95-folder-nav-button" onClick={handleBackClick}>
              <div className="arrow-left"></div>
            </button>
            )}
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
        {currentView === 'years' ? (
          filteredYears.map((year, index) => (
            <div
              key={year}
              id={`folder-${index}`}
              className="flex flex-col items-center justify-center gap-1 p-2 cursor-pointer hover:bg-blue-100"
              onDoubleClick={() => handleFolderDoubleClick(year)}
            >
              <img src="/win95-folder-icon.png" className="w-8 h-8" />
              <p>{year}</p>
              <p className="text-xs text-gray-500">
                {incidentsByYear[year].length} incidents
              </p>
            </div>
          ))
        ) : (
          visibleIncidents.length > 0 ? (
            visibleIncidents.map((entry, index) => {
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
            })
          ) : (
            <div className="text-center my-8 w-full">
              <p>No incidents match your search criteria.</p>
            </div>
          )
        )}
      </div>

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