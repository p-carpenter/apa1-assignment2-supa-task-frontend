"use client";

function ExplorerWindow({ incidents, onIncidentClick, onContextMenu }) {
  const handleRightClick = (event, isFile) => {
    event.preventDefault();
    onContextMenu({ visible: true, x: event.clientX, y: event.clientY, onFile: isFile });
  };

  return (
    <div className="w-[70vw] h-[90vh] border-4 border-win95gray bg-white flex flex-col">
      {/* Window Bar */}
      <div className="flex justify-between items-center bg-win95blue text-white px-2 py-1">
        <div className="flex items-center gap-2">
          <img src="/win95-folder-icon.png" alt="Folder Icon" className="w-5 h-5" />
          <p>Technology Failures</p>
        </div>
        <div className="flex gap-2">
          <div id="min-button" className="w-4 h-4 bg-win95gray border border-win95border"></div>
          <div id="max-button" className="w-4 h-4 bg-win95gray border border-win95border"></div>
          <div id="close-button" className="w-4 h-4 bg-win95gray border border-win95border"></div>
        </div>
      </div>

      {/* Explorer Header */}
      <div className="">
        <div className="flex items-center text-black gap-2 px-2 text-sm bg-win95gray h-[30px] px-10 border-bottom border-1 border-win95border">
          <p>File</p>
          <p>Edit</p>
          <p>View</p>
          <p>Help</p>
        </div>
        <div className="flex items-center bg-win95gray border border-win95border px-2 h-[32px] gap-[5px] text-black ">
          <p>Address</p>
          <p className="explorer-path">C:\Technology Failures</p>
          <div className="flex gap-2 direction-row items-center content-center">
            <img src="/search.png" className="w-6 h-6 box-border border border-2 border-win95border" />
          </div>
        </div>
      </div>

      {/* File Explorer Content */}
      <div className="flex-grow flex flex-wrap p-4 gap-4 overflow-auto">
        {incidents.map((entry, index) => (
          <div
            key={index}
            className="text-center relative"
            onDoubleClick={() => onIncidentClick(entry)}
            onContextMenu={(e) => handleRightClick(e, true)}
          >
            <div className="relative">
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
