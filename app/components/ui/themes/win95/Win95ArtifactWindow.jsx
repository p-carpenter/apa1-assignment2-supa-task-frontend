import React from "react";
import TitleBar from "./Win95TitleBar";
import StandardArtifact from "../../artifacts/StandardArtifact";
import WindowsNTBSOD from "../../../artifacts/2000s/WindowsNTBSOD.jsx";
import ATTNetworkCollapse from "../../../artifacts/1990s/ATTNetworkCollapse.jsx";
import Y2KBug from "../../../artifacts/1990s/Y2KBug.jsx";
import Therac25Accidents from "../../../artifacts/1980s/Therac25Accidents.jsx";
import YTViewCounter from "../../../artifacts/2010s/YTViewCounter.jsx";
import Win95RecycleBin from "../../../artifacts/1990s/Win95RecycleBin.jsx";
import MarsClimateCrash from "../../../artifacts/1990s/MarsClimateCrash.jsx";

const Win95ArtifactWindow = ({ incident, onClose, decade }) => {
  const getArtifactDimensions = () => {
    return {
      baseWidth: "1024px",
      baseHeight: "600px",
    };
  };

    const renderArtifact = () => {
      if (incident.artifactType === "image") {
        return (
          <img
            src={incident.artifactContent}
            alt={incident.name}
            className="artifact-image"
            style={{height: '600px'}}
          />
        );
      } else if (incident.artifactType === "code") {
        return (
          <iframe className="artifact-code" style={{height: '600px'}} srcDoc={incident.artifactContent}></iframe>
        );
      } else {
        return <div>No visualization available</div>;
      }
    }

  const { baseWidth, baseHeight } = getArtifactDimensions();

  return (
    <div
      className="win95-artifact-window"
      style={{ width: baseWidth, height: baseHeight }}
    >
      <TitleBar title={incident.name} onClose={onClose} />
      <StandardArtifact decade={decade} title={incident.name}>
        {renderArtifact()}
      </StandardArtifact>
    </div>
  );
};

export default Win95ArtifactWindow;
