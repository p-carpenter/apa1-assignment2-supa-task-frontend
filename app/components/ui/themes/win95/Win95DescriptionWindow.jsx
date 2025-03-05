import React from "react";
import TitleBar from "./Win95TitleBar";

const Win95DescriptionWindow = ({
  incident,
  incidents,
  onClose,
  currentIndex,
  onNavigate,
  decade,
  theme,
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

  // Helper function to get severity class
  const getSeverityClass = (severity) => {
    switch (severity.toLowerCase()) {
      case "high":
        return "win95-severity-high";
      case "medium":
        return "win95-severity-medium";
      case "low":
        return "win95-severity-low";
      default:
        return "win95-severity-medium";
    }
  };

  return (
    <div className="win95-window win95-description-window">
      <TitleBar
        title={`${incident.name} - Details`}
        icon={"win95-folder-icon.png"}
        onClose={onClose}
        showMaximize={false}
        showMinimize={false}
        theme={theme}
      />

      <div className="win95-description-content">
        {/* Left Column - Description Content*/}
        <div className="win95-description-text">
          <h2 className="text-xl font-bold mb-2">{incident.name}</h2>
          <div className="win95-info-box">
            <div className="win95-lightbulb-container">
              <img
                src="/winNTlightbulb.svg"
                alt="Lightbulb Icon"
                className="win95-lightbulb-icon"
              />
              <p className="font-bold">Did you know...</p>
            </div>

            <p className="win95-detail-text">{incident.description}</p>
            <p className="win95-detail-text">Date: {incident.formatted_date}</p>
            <p className="win95-detail-text">Category: {incident.category}</p>
            <p className="win95-detail-text">
              Severity:
              <span
                className={`win95-severity-indicator ${getSeverityClass(incident.severity)}`}
              ></span>
            </p>
            <p className="win95-detail-text">Cause: {incident.cause}</p>
            <p className="win95-detail-text">
              Consequences: {incident.consequences}
            </p>
            <p className="win95-detail-text">
              Time to resolve: {incident.time_to_resolve}
            </p>
          </div>
        </div>

        {/* Right Column - Navigation Buttons */}
        <div className="win95-navigation">
          <button onClick={goToPrevious} className="win95-button">
            Previous
          </button>
          <button onClick={goToNext} className="win95-button">
            Next
          </button>
        </div>
      </div>
    </div>
  );
};

export default Win95DescriptionWindow;
