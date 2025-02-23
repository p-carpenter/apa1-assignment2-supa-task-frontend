"use client";

import { useEffect, useState } from "react";
import ExplorerWindow from "@/app/components/ExplorerWindow";
import IncidentPopup from "@/app/components/IncidentPopup";
import ContextMenu from "@/app/components/ContextMenu";
import Terminal from "@/app/components/Terminal";

export default function Home() {
  const [incidentData, setIncidentData] = useState([]);
  const [selectedIncident, setSelectedIncident] = useState(null);
  const [contextMenu, setContextMenu] = useState({ visible: false, x: 0, y: 0, onFile: false });

  useEffect(() => {
    const fetchIncidents = async () => {
      try {
        const response = await fetch("/api/tech-incidents");
        if (!response.ok) throw new Error(`Error: ${response.status}`);
        const data = await response.json();
        setIncidentData(data);
      } catch (error) {
        console.error(error);
      }
    };
    fetchIncidents();
  }, []);

  return (
    <div className="flex items-center justify-center h-screen bg-[rgb(0,128,127)]">
      <ExplorerWindow
        incidents={incidentData}
        onIncidentClick={setSelectedIncident}
        onContextMenu={setContextMenu}
      />
      {selectedIncident && <IncidentPopup incident={selectedIncident} onClose={() => setSelectedIncident(null)} />}
      {contextMenu.visible && <ContextMenu {...contextMenu} />}
      <Terminal />
    </div>
  );
}
