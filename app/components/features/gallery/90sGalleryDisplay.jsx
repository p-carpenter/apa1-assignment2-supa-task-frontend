import React from "react";
import { useTheme } from "../../../contexts/ThemeContext";
import Win95ArtifactWindow from "./Win95ArtifactWindow";
import Win95DescriptionWindow from "./Win95DescriptionWindow";
import Win95Taskbar from "../../ui/win95/Win95Taskbar";
import Win95DesktopIcons from "../../ui/win95/Win95DesktopIcons";
import "./90sGalleryDisplay.styles.css";

const Win95GalleryDisplay = ({
  incident,
  incidents,
  onClose,
  currentIndex,
  onNavigate,
}) => {
  const { theme } = useTheme();

  if (!incident) return null;

  return (
    <div className="win95-gallery-container">
      <Win95DesktopIcons />

      <div className="win95-desktop-area">
        <div className="win95-windows-container">
          {/* Artifact window with fixed size */}
          <Win95ArtifactWindow
            incident={incident}
            onClose={onClose}
            decade={1990}
            theme={theme}
          />

          {/* Description window justified to the top */}
          <Win95DescriptionWindow
            incident={incident}
            incidents={incidents}
            onClose={onClose}
            currentIndex={currentIndex}
            onNavigate={onNavigate}
            decade={1990}
            theme={theme}
          />
        </div>
      </div>

      <Win95Taskbar activeWindow={incident.name} decade={1990} />
    </div>
  );
};

export default Win95GalleryDisplay;
