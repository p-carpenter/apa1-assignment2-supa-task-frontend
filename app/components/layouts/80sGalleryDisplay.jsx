import React from "react";
import DOSPanel from "../ui/themes/dos/DOSPanel";
import { useTheme } from "../../contexts/ThemeContext";
import "./80sGalleryDisplay.styles.css";
import { formatDate } from "@/app/utils/formatting/dateUtils";
import MorrisWorm from "../artifacts/1980s/MorrisWorm";
import Therac25Accidents from "../artifacts/1980s/Therac25Accidents";
import StandardArtifact from "../ui/artifacts/StandardArtifact";

const DOSGalleryDisplay = ({
  incident,
  incidents,
  onClose,
  currentIndex,
  decade,
}) => {
  const { theme } = useTheme();

  if (!incident) return null;

  // Helper function to render the appropriate artifact
  const renderArtifact = () => {
    switch (incident.name) {
      case "Morris Worm":
        return <MorrisWorm />;
      case "Therac-25 Radiation Accidents":
        return <Therac25Accidents />;
      default:
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

  // Norton Commander style display with two panels
  return (
    <div className="dos-gallery">
      {/* Main container with two panels */}
      <div className="dos-gallery__main-container">
        {/* Left Panel - File Browser/Artifact Display */}
        <DOSPanel
          title={`C:/INCIDENTS/${decade}S/${incident.name.toUpperCase()}`}
          className="dos-panel__file-browser"
          position="left"
        >
          <div className="dos-panel-left__content">
            <div className="item-wrapper">
              <StandardArtifact
                decade={decade}
                title={incident.name}
                date={formatDate(incident.incident_date, "dos")}
              >
                {renderArtifact()}
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

        {/* Right Panel - Information */}
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
