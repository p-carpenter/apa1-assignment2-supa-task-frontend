"use client";

import { useState } from "react";
import IncidentVisualisationCard from "./viewer/IncidentVisualisationCard.jsx";
import IncidentDescriptionCard from "./viewer/IncidentDescriptionCard.jsx";

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

  if (!incident) return null;

  return (
    <div className="fixed inset-0 w-full h-full bg-teal z-50 flex items-center justify-center">
      <div className="flex flex-row justify-center items-start gap-4">
        <IncidentVisualisationCard incident={incident} onClose={onClose} />

        <IncidentDescriptionCard
          incident={incident}
          incidents={incidents}
          onClose={onClose}
          currentIndex={currentIndex}
          onNavigate={onNavigate}
        />
      </div>
    </div>
  );
}
