import React from "react";
import DOSPanel from "../../ui/dos/DOSPanel";
// import ArtifactContainer from "../../common/ArtifactContainer"; // New standardized component
import { useTheme } from "../../../contexts/ThemeContext";
import "./80sGalleryDisplay.styles.css";
import { formatDate } from "@/app/utils/dateUtils";
import MorrisWorm from "../../artifacts/1980s/MorrisWorm"; // Your artifact components
import Therac25Accidents from "../../artifacts/1980s/Therac25Accidents";
import StandardArtifact from "../../common/StandardArtifact";
// Import other artifact components...

const DOSGalleryDisplay = ({
  incident,
  incidents,
  onClose,
  currentIndex,
  onNavigate,
  decade,
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

  // Helper function to render the appropriate artifact
  const renderArtifact = () => {
    // Get appropriate expansion ratio for this artifact type
    const getExpandRatio = () => {
      switch (incident.name) {
        case "Morris Worm":
          return 1.4; // Wider for code display
        case "Therac-25 Radiation Accidents":
          return 1.3; // Custom ratio for this artifact
        default:
          return 1.25; // Default ratio
      }
    };

    // Component selection based on incident name
    const getArtifactComponent = () => {
      switch (incident.name) {
        case "Morris Worm":
          return <MorrisWorm />;
        case "Therac-25 Radiation Accidents":
          return <Therac25Accidents />;
        // Add other cases for your 80s artifacts
        default:
          // Fallback for simple content types
          if (incident.artifactType === "image") {
            return (
              <img
                src={incident.artifactContent}
                alt={incident.name}
                className="artifact-image"
              />
            );
          } else if (incident.artifactType === "code") {
            return (
              <pre className="artifact-code">{incident.artifactContent}</pre>
            );
          } else {
            return <div>No visualization available</div>;
          }
      }
    };

    // Render the selected artifact within the container
    return (
      <ArtifactContainer
        title={incident.name}
        slug={incident.name.toLowerCase().replace(/\s+/g, "-")}
        date={incident.incident_date}
        decade={1980}
        expandRatio={getExpandRatio()}
        description={incident.description} // Pass description as prop
      >
        {getArtifactComponent()}
      </ArtifactContainer>
    );
  };

  // Norton Commander style display with two panels
  return (
    <div className="dos-gallery">
      {/* Main container with two panels */}
      <div className="dos-gallery__main-container">
        {/* Left Panel - File Browser/Artifact Display */}
        <DOSPanel
          title={`C:/TECHNOLOGY INCIDENTS/${decade}S/${incident.name.toUpperCase()}`}
          className="dos-panel__file-browser"
          position="left"
        >
          <div className="dos-panel-left__content">
            <div className="item-wrapper">
              <StandardArtifact
                decade={1980}
                title={incident.name}
                date={formatDate(incident.incident_date, "dos")}
              >
                {/* Render appropriate artifact content */}
                {incident.name === "Morris Worm" && <MorrisWorm />}
                {incident.name === "Therac-25 Radiation Accidents" && (
                  <Therac25Accidents />
                )}
                {/* etc. */}
              </StandardArtifact>
            </div>
            <div className="dos-panel-footer">
              <p>{formatDate(incident.incident_date, "dos")}</p>
              <p>
                {new Date().toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
            </div>
          </div>
        </DOSPanel>

        {/* Right Panel - Info (Keep this as is) */}
        <DOSPanel title="Info" className="dos-panel__info" position="right">
          <div className="dos-info-content">
            <div className="dos-info-header">
              <div className="dos-info-title">{incident.name}</div>
              <div className="dos-info-date">
                {formatDate(incident.incident_date)}
              </div>
            </div>

            <div className="dos-info-description">{incident.description}</div>

            <div className="dos-info-field">
              <span className="dos-info-label">Severity: </span>
              {incident.severity}
            </div>
            <div className="dos-info-field">
              <span className="dos-info-label">Cause: </span>
              {incident.cause}
            </div>
            <div className="dos-info-field">
              <span className="dos-info-label">Consequences: </span>
              {incident.consequences}
            </div>
            <div className="dos-info-field">
              <span className="dos-info-label">Time to resolve: </span>
              {incident.time_to_resolve}
            </div>
          </div>

          {/* Navigation buttons */}
          <div className="dos-navigation">
            <button onClick={goToPrevious} className="dos-nav-button">
              « Prev
            </button>
            <button onClick={goToNext} className="dos-nav-button">
              Next »
            </button>
          </div>
        </DOSPanel>
      </div>

      {/* Bottom Function Keys Bar */}
      <div className="dos-function-bar">
        <div className="dos-path">
          Path: Incidents/{incident.category}/{incident.name}
        </div>
        <div className="dos-function-keys">
          <span>
            <span className="dos-function-key">F1</span> Help
          </span>
          <span>
            <span className="dos-function-key">F3</span> View
          </span>
          <span>
            <span className="dos-function-key">F10</span>
            <span onClick={onClose} className="dos-clickable">
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
