import React from "react";
import TitleBar from "../common/TitleBar";

const IncidentDescriptionCard = ({
  incident,
  incidents,
  onClose,
  currentIndex,
  onNavigate,
}) => {
  const goToNext = () => {
    const nextIndex = (currentIndex + 1) % incidents.length;
    onNavigate(nextIndex);
  };

  const goToPrevious = () => {
    const prevIndex =
      currentIndex === 0 ? incidents.length - 1 : currentIndex - 1;
    onNavigate(prevIndex);
  };

  return (
    <div className="explorer-container w-[30vw] max-w-sm h-[auto] flex flex-col border-4 border-gray-300 shadow-win95 overflow-hidden">
      <TitleBar
        title={`${incident.name} - Visualization`}
        onClose={onClose}
        showMaximize={false}
        showMinimize={false}
      />

      {/* Main content area with two columns */}
      <div className="flex-grow bg-win95gray grid grid-cols-[3fr,1fr] gap-2">
        {/* Left Column - Description Content (wider) */}
        <div className="p-4 overflow-auto">
          <h2 className="text-xl font-bold mb-2">{incident.name}</h2>
          <div className="polka-bg items-center justify-center p-4">
            <div className="grid grid-cols-[auto,1fr] gap-2">
              <img
                src="winNTlightbulb.svg"
                alt="Lightbulb Icon"
                className="h-10"
              />
              <p className="font-mssansserif text-xs font-bold m-3">
                Did you know...
              </p>
            </div>
            <div className="text-xs font-mssansserif">
              <p className="mb-4">{incident.description}</p>
              <p className="mb-2">Date: {incident.incident_date}</p>
              <p className="mb-2">Category: {incident.category}</p>
              <p className="flex items-center mb-2">
                Severity:
                <span
                  className={`ml-2 w-3 h-3 rounded-full ${
                    incident.severity === "High"
                      ? "bg-red-500"
                      : incident.severity === "Medium"
                        ? "bg-yellow-500"
                        : "bg-green-500"
                  }`}
                />
              </p>
              <p className="mb-2">Cause: {incident.cause}</p>
              <p className="mb-2">Consequences: {incident.consequences}</p>
              <p className="mb-2">
                Time to resolve: {incident.time_to_resolve}
              </p>
            </div>
          </div>
        </div>

        {/* Right Column - Navigation Buttons (pushed to the right) */}
        <div className="flex flex-col justify-center items-end p-2">
          <button
            onClick={goToPrevious}
            className="win95-button h-7 w-full mb-2"
          >
            Previous
          </button>
          <button onClick={goToNext} className="win95-button h-7 w-full">
            Next
          </button>
        </div>
      </div>
    </div>
  );
};

export default IncidentDescriptionCard;
