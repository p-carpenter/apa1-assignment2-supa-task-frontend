import React from "react";
import TitleBar from "../common/TitleBar";
import { ChevronLeft, ChevronRight } from "lucide-react";
import Terminal from "../visualisations/Terminal.jsx";
import WindowsNTBSOD from "../visualisations/WindowsNTBSOD.jsx";
import ATTNetworkCollapse from "../visualisations/ATTNetworkCollapse.jsx";
import Y2KBug from "../visualisations/Y2KBug.jsx";
import Therac25Accidents from "../visualisations/Therac25Accidents.jsx";
import SpaceInvadersLvl from "../visualisations/SpaceInvadersLvl.jsx";
import YTViewCounter from "../visualisations/YTViewCounter.jsx";
import Win95RecycleBin from "../visualisations/Win95RecycleBin.jsx";
import MarsClimateCrash from "../visualisations/MarsClimateCrash.jsx";

const IncidentVisualisationCard = ({ incident, onClose, decade, theme }) => {
  const renderVisualization = () => {
    switch (incident.name) {
      case "Morris Worm":
        return <Terminal />;
      case "Y2K Bug":
        return <Y2KBug />;
      case "Mars Climate Orbiter Crash":
        return <MarsClimateCrash />;
      case "Space Invaders Kill Screen":
        return <SpaceInvadersLvl />;
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
        // Default visualization if none specific exists
        return (
          <div className="bg-white p-8 text-black text-center">
            <h2 className="text-xl font-bold mb-4">{incident.name}</h2>
            <p className="mb-4">{incident.description}</p>
          </div>
        );
    }
  };

  return (
    <div className={`w-[auto] max-w-4xl h-[70vh] flex flex-col ${
      decade >= 1990 ? 'border-[3px] border-win95gray shadow-win95' : 'border border-[#00ff00]'
    } mr-4`}>
      <TitleBar
        icon={decade >= 1990 ? "win95-folder-icon.png" : null}
        title={`${incident.name} - Visualization`}
        onClose={onClose}
        theme={theme}
      />

      <div className={`flex-grow ${theme.background} flex items-center justify-center p-2`}>
        {renderVisualization()}
      </div>
    </div>
  );
};

export default IncidentVisualisationCard;
