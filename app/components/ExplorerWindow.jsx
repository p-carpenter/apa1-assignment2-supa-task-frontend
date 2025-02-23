"use client";

export default function ExplorerWindow({ incidents, onIncidentClick, onContextMenu }) {
  const handleRightClick = (event, isFile) => {
    event.preventDefault();
    onContextMenu({ visible: true, x: event.clientX, y: event.clientY, onFile: isFile });
  };

  return (
    <div className="explorer-container">
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

      {/* File Explorer Content */}
      <div className="explorer-content">
        {incidents.map((entry, index) => (
          <div
            key={index}
            className="case-container"
            onDoubleClick={() => onIncidentClick(entry)}
            onContextMenu={(e) => handleRightClick(e, true)}
          >
            <div className="casefile">
              <img src="/computer.png" className="w-12 h-12" />
              <div className={`absolute bottom-0 right-0 w-3 h-3 rounded-full ${entry.severity.toLowerCase()}`} />
            </div>
            <p>{entry.name}</p>
            <p className="text-xs bg-gray-300 px-2 category-label">{entry.category}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
