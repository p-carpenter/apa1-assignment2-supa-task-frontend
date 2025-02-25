"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import Terminal from "./artifacts/Terminal.jsx";
import WindowsNTBSOD from "./artifacts/WindowsNTBSOD.jsx";
import ATTNetworkCollapse from "./artifacts/ATTNetworkCollapse.jsx";
import Y2KBug from "./artifacts/Y2KBug.jsx";
import Therac25Accidents from "./artifacts/Therac25Accidents.jsx";
import SpaceInvadersLvl from "./artifacts/SpaceInvadersLvl.jsx";
import YTViewCounter from "./artifacts/YTViewCounter.jsx";
import Win95RecycleBin from "./artifacts/Win95RecycleBin.jsx";
import MarsClimateCrash from "./artifacts/MarsClimateCrash.jsx";

const CategoryThemes = {
  Security: {
    background: "bg-[#1a1a1a]",
    text: "text-[#50fa7b]",
    fontFamily: "font-mono",
  },
  Game: {
    background: "bg-[#000040]",
    text: "text-[#f8f8f2]",
    fontFamily: "font-mono",
  },
  Hardware: {
    background: "bg-[#2d3436]",
    text: "text-[#dfe6e9]",
    fontFamily: "font-mono",
  },
  Network: {
    background: "bg-[#2c3e50]",
    text: "text-[#3498db]",
    fontFamily: "font-mono",
  },
  Software: {
    background: "bg-[#2f3640]",
    text: "text-[#f5f6fa]",
    fontFamily: "font-mono",
  },
};

export default function TechIncidentViewer({
  incident,
  onClose,
  incidents,
  currentIndex,
  onNavigate,
}) {
  const theme = CategoryThemes[incident.category] || CategoryThemes.Software;

  const goToNext = () => {
    const nextIndex = (currentIndex + 1) % incidents.length;
    onNavigate(nextIndex);
  };

  const goToPrevious = () => {
    const prevIndex =
      currentIndex === 0 ? incidents.length - 1 : currentIndex - 1;
    onNavigate(prevIndex);
  };

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

  if (!incident) return null;

  return (
    // Teal desktop background
    <div className="fixed inset-0 w-full h-full bg-teal z-50 flex items-center justify-center">
      <div className="flex flex-row justify-center items-start gap-4">
        {/* Left Window: Visualization Container */}
        <div className="explorer-container w-[auto] max-w-4xl h-[70vh] flex flex-col border-4 border-gray-300 shadow-win95 mr-4">
          {/* Title Bar */}
          <div className="explorer-window-bar flex justify-between items-center h-8 px-2 bg-win95blue text-white">
            <div className="flex items-center gap-2">
              <img
                src="/win95-folder-icon.png"
                alt="Folder Icon"
                className="w-4 h-4"
              />
              <p className="text-sm">{incident.name} - Visualization</p>
            </div>
            <button
              onClick={onClose}
              className="bg-gray-200 text-black px-2 text-xs"
            >
              X
            </button>
          </div>

          {/* Visualization Content */}
          <div className="flex-grow bg-gray-100 flex items-center justify-center p-2">
            {renderVisualization()}
          </div>
        </div>

        {/* Right Window: Description Panel (floating) */}
        <div className="explorer-container w-[30vw] max-w-sm h-[auto] flex flex-col border-4 border-gray-300 shadow-win95 overflow-hidden">
          {/* Title Bar */}
          <div className="explorer-window-bar flex justify-between items-center h-8 px-2 bg-win95blue text-white">
            <div className="flex items-center gap-2 m-1">
              <p className="text-sm">{incident.name} - Details</p>
            </div>
            <div className="flex">
              <button className="bg-gray-200 text-black px-2 text-xs ml-1">
                _
              </button>
              <button className="bg-gray-200 text-black px-2 text-xs ml-1">
                □
              </button>
              <button
                onClick={onClose}
                className="bg-gray-200 text-black px-2 text-xs ml-1"
              >
                X
              </button>
            </div>
          </div>

          {/* Description Content */}
          <div className="flex-grow bg-win95gray p-4 overflow-auto grid grid-cols-[auto, 1fr] gap-4">
            <div className="flex justify-end p-2 bg-win95gray border-t border-[#808080] col-2">
              {/* <button
    onClick={goToPrevious}
    className="px-4 py-2 border border-[#808080] bg-[#dfdfdf] text-black shadow-inner-win95 active:shadow-none mr-2"
  >
    PREV
  </button>
  <button
    onClick={goToNext}
    className="px-4 py-2 border border-[#808080] bg-[#dfdfdf] text-black shadow-inner-win95 active:shadow-none"
  >
    NEXT →
  </button> */}
            </div>

            <h2 className="text-xl font-bold mb-2 col-1">{incident.name}</h2>
            <div className="polka-bg items-center justify-center p-4 grid customgrid col-1">
              <img
                src="winNTlightbulb.svg"
                alt="Lightbulb Icon"
                className="h-10 firstcol"
              />
              <p className="font-mssansserif text-xs font-bold secondcol m-3">
                Did you know...
              </p>
              <div className="secondcol ml-3 text-xs font-mssansserif">
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
        </div>
      </div>
    </div>
  );
}
