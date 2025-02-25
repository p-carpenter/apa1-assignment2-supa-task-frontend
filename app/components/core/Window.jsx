"use client";
import { useRef, useState, useEffect } from "react";

export default function Window({
  incidents,
  title
}) {
 
  return (
    <div
      className="explorer-container shadow-win95"
    >
            {/* Window Bar */}
      <div className="explorer-window-bar">
        <div className="folder-name">
          <img src="/win95-folder-icon.png" alt="Folder Icon" />
          <p>{title}</p>
        </div>
        <div className="window-buttons">
          <div id="min-button"></div>
          <div id="max-button"></div>
          <div id="close-button"></div>
        </div>
      </div>

      <div className="explorer-content bg-win95gray">

      </div>


    </div>
  );
}
