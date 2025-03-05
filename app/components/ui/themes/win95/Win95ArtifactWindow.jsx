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
      baseHeight: "auto",
    };
  };

  const renderVisualization = () => {
    switch (incident.name) {
      case "Y2K Bug":
        return <Y2KBug />;
      case "Mars Climate Orbiter Crash":
        return <MarsClimateCrash />;
      case "Gangnam Style View Counter Break":
        return <YTViewCounter />;
      case "Windows 95 RecycleBin Path Length Bug":
        return <Win95RecycleBin />;
      case "Windows NT 4.0 Blue Screen":
        return <WindowsNTBSOD />;
      case "AT&T Network Collapse":
        return <ATTNetworkCollapse />;
      case "Therac-25 Radiation Accidents":
        return <Therac25Accidents />;
      default:
        return (
          <div className="bg-white p-8 text-black text-center">
            <h2 className="text-xl font-bold mb-4">{incident.name}</h2>
            <p className="mb-4">{incident.description}</p>
          </div>
        );
    }
  };

  const { baseWidth, baseHeight } = getArtifactDimensions();

  return (
    <div
      className="win95-artifact-window"
      style={{ width: baseWidth, height: baseHeight }}
    >
      <TitleBar title={incident.name} onClose={onClose} />
      <StandardArtifact decade={decade} title={incident.name}>
        {renderVisualization()}
      </StandardArtifact>
    </div>
  );
};

export default Win95ArtifactWindow;
