"use client"

import { useState } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import Terminal from "./artifacts/Terminal.jsx"
import WindowsNTBSOD from "./artifacts/WindowsNTBSOD.jsx"
import ATTNetworkCollapse from "./artifacts/ATTNetworkCollapse.jsx"
import Y2KBug from "./artifacts/Y2KBug.jsx"
import Therac25Accidents from "./artifacts/Therac25Accidents.jsx"
import SpaceInvadersLvl from "./artifacts/SpaceInvadersLvl.jsx"
import YTViewCounter from "./artifacts/YTViewCounter.jsx"
import Win95RecycleBin from "./artifacts/Win95RecycleBin.jsx"
import MarsClimateCrash from "./artifacts/MarsClimateCrash.jsx"

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
}

export default function TechIncidentViewer({ incident, onClose, incidents, currentIndex, onNavigate }) {
  const theme = CategoryThemes[incident.category] || CategoryThemes.Software

  const goToNext = () => {
    const nextIndex = (currentIndex + 1) % incidents.length
    onNavigate(nextIndex)
  }

  const goToPrevious = () => {
    const prevIndex = currentIndex === 0 ? incidents.length - 1 : currentIndex - 1
    onNavigate(prevIndex)
  }

  const renderVisualization = () => {
    switch (incident.name) {
      case "Morris Worm":
        return <Terminal />
      case "Y2K Bug":
        return <Y2KBug/>
      case "Mars Climate Orbiter Crash":
        return <MarsClimateCrash/>
      case "Space Invaders Kill Screen":
        return <SpaceInvadersLvl/>
      case "Gangnam Style View Counter Break":
        return <YTViewCounter/>
      case "Windows 95 RecycleBin Path Length Bug":
        return <Win95RecycleBin/>
      case "Windows NT 4.0 Blue Screen":
        return <WindowsNTBSOD/>
      case "AT&T Network Collapse":
        return <ATTNetworkCollapse/>
      case "Therac-25 Radiation Accidents":
        return <Therac25Accidents/>
      default:
        // Default visualization if none specific exists
        return (
          <div className="bg-white p-8 text-black text-center">
            <h2 className="text-xl font-bold mb-4">{incident.name}</h2>
            <p className="mb-4">{incident.description}</p>
          </div>
        )
    }
  }

  if (!incident) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="w-11/12 max-w-5xl bg-[#f5e9d7] pb-12 relative">
        <div className="flex justify-end items-center px-4 py-2">
          <button 
            className="px-3 py-1 opacity-70 hover:opacity-100"
            onClick={onClose}
          >
            Catalog
          </button>
        </div>

          <div className="flex flex-col md:flex-row px-4 gap-6">
            <div className="md:w-3/5 shadow-lg">
              <div className={`w-full ${theme.background} ${theme.fontFamily} ${theme.text}`}>
                {renderVisualization()}
              </div>
            </div>
            
            <div className="md:w-2/5">
              <div className="border border-[#c0b5a5] bg-white p-6">
                <h2 className="text-2xl font-serif mb-2 uppercase">{incident.name}</h2>
                <div className="prose prose-sm">
                  <p className="mb-4">{incident.description}</p>
                  <p>Date: {incident.incident_date}</p>
                  <p>Category: {incident.category}</p>
                  <p className="flex items-center">
                    Severity: 
                    <span className={`ml-2 w-3 h-3 rounded-full bg-${incident.severity === 'High' ? 'red' : incident.severity === 'Medium' ? 'yellow' : 'green'}-500`}></span>
                  </p>
                </div>
              </div>
            </div>
          </div>

        <div className="absolute bottom-4 right-4 flex space-x-2">
          <button
            onClick={goToPrevious}
            className="px-4 py-2 border border-[#c0b5a5] bg-white hover:bg-[#f0e5d0] flex items-center"
          >
            <span>PREV</span>
          </button>
          <button
            onClick={goToNext}
            className="px-4 py-2 border border-[#c0b5a5] bg-white hover:bg-[#f0e5d0] flex items-center"
          >
            <span>NEXT →</span>
          </button>
        </div>
      </div>
    </div>
  )
}