import React from "react";
import { useTheme } from "../../../contexts/ThemeContext";
import IncidentVisualisationCard from "./IncidentVisualisationCard";
import IncidentDescriptionCard from "./IncidentDescriptionCard";

const Win95GalleryDisplay = ({
  incident,
  incidents,
  onClose,
  currentIndex,
  onNavigate,
}) => {
  const { theme } = useTheme();

  if (!incident) return null;

  const styles = {
    container: `fixed inset-0 w-full h-full ${theme.background} z-50 flex items-center justify-center ${theme.fontFamily}`,
    contentWrapper: `flex flex-row justify-center items-start gap-4 ${theme.text}`,
  };

  return (
    <div className={styles.container}>
      <div className={styles.contentWrapper}>
        <IncidentVisualisationCard
          incident={incident}
          onClose={onClose}
          decade={1990}
          theme={theme}
        />

        <IncidentDescriptionCard
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
  );
};

export default Win95GalleryDisplay;
