import React from "react";
import DOSPanel from "../../ui/dos/DOSPanel";
import { useTheme } from "../../../contexts/ThemeContext";

const DOSGalleryDisplay = ({
  incident,
  incidents,
  onClose,
  currentIndex,
  onNavigate,
}) => {
  const { theme } = useTheme();

  if (!incident) return null;

  const goToNext = () => {
    const nextIndex = (currentIndex + 1) % incidents.length;
    onNavigate(nextIndex);
  };

  const goToPrevious = () => {
    const prevIndex =
      currentIndex === 0 ? incidents.length - 1 : currentIndex - 1;
    onNavigate(prevIndex);
  };

  // Norton Commander style display with two panels
  return (
    <div className="fixed inset-0 w-full h-full bg-[#0000aa] z-50 flex flex-col p-2 font-mono">
      {/* Main container with two panels */}
      <div className="flex-1 flex gap-2 mb-2">
        {/* Left Panel - File Browser */}
        <DOSPanel title={`Incident: ${incident.name}`} className="flex-1">
          <div className="flex border-b-4 border-double border-[#00ffff] text-[#00ffff] font-bold">
            <div className="flex-3 text-center border-r-4 border-double border-[#00ffff] py-1">
              Name
            </div>
            <div className="flex-2 text-center border-r-4 border-double border-[#00ffff] py-1">
              Type
            </div>
            <div className="flex-2 text-center py-1">Date</div>
          </div>

          <div className="overflow-auto h-[calc(100%-2rem)]">
            {incidents.map((inc, idx) => (
              <div
                key={inc.id}
                className={`flex py-1 cursor-pointer ${idx === currentIndex ? "bg-[#00ffff] text-[#0000aa]" : ""}`}
                onClick={() => onNavigate(idx)}
              >
                <div className="flex-3 pl-4 overflow-hidden text-ellipsis whitespace-nowrap">
                  {inc.name}
                </div>
                <div
                  className={`flex-2 text-center ${idx === currentIndex ? "text-[#0000aa]" : "text-[#00ffff]"}`}
                >
                  {inc.category}
                </div>
                <div
                  className={`flex-2 text-right pr-4 ${idx === currentIndex ? "text-[#0000aa]" : "text-[#00ffff]"}`}
                >
                  {inc.incident_date}
                </div>
              </div>
            ))}
          </div>
        </DOSPanel>

        {/* Right Panel - Info */}
        <DOSPanel title="Info" className="w-1/2">
          <div className="p-4 h-full overflow-auto">
            <div className="mb-4 text-center">
              <div className="text-lg mb-2">{incident.name}</div>
              <div className="text-[#00ffff] border-t border-b border-[#00ffff] py-1 mb-4">
                {incident.incident_date}
              </div>
            </div>

            <div className="mb-3">{incident.description}</div>

            <div className="mb-2">
              <span className="text-[#00ffff]">Severity: </span>
              {incident.severity}
            </div>
            <div className="mb-2">
              <span className="text-[#00ffff]">Cause: </span>
              {incident.cause}
            </div>
            <div className="mb-2">
              <span className="text-[#00ffff]">Consequences: </span>
              {incident.consequences}
            </div>
            <div className="mb-2">
              <span className="text-[#00ffff]">Time to resolve: </span>
              {incident.time_to_resolve}
            </div>
          </div>

          {/* Navigation buttons */}
          <div className="flex justify-between border-t-4 border-double border-[#00ffff] p-2">
            <button onClick={goToPrevious} className="text-[#00ffff] font-bold">
              « Prev
            </button>
            <button onClick={goToNext} className="text-[#00ffff] font-bold">
              Next »
            </button>
          </div>
        </DOSPanel>
      </div>

      {/* Bottom Function Keys Bar */}
      <div className="border-4 border-double border-[#00ffff] py-1 px-2 flex justify-between">
        <div className="text-[#ffff00]">
          Path: Incidents/{incident.category}/{incident.name}
        </div>
        <div className="flex gap-3">
          <span>
            <span className="text-[#00ffff] font-bold">F1</span> Help
          </span>
          <span>
            <span className="text-[#00ffff] font-bold">F3</span> View
          </span>
          <span>
            <span className="text-[#00ffff] font-bold">F10</span>
            <span onClick={onClose} className="cursor-pointer">
              {" "}
              Quit
            </span>
          </span>
        </div>
      </div>
    </div>
  );
};

export default DOSGalleryDisplay;
