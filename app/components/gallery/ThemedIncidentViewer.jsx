import React from "react";
import IncidentVisualisationCard from "./IncidentVisualisationCard";
import IncidentDescriptionCard from "./IncidentDescriptionCard";

const ThemedGalleryDisplay = ({
  incident,
  incidents,
  onClose,
  currentIndex,
  onNavigate,
  decade,
  theme,
}) => {
  const getDecadeSpecificStyles = () => {
    return {
      container: `fixed inset-0 w-full h-full ${theme.background} z-50 flex items-center justify-center ${theme.fontFamily}`,
      contentWrapper: `flex flex-row justify-center items-start gap-4 ${theme.text}`,
    };
  };

  const styles = getDecadeSpecificStyles();

  if (!incident) return null;

  return (
    <div className={styles.container}>
      <div className={styles.contentWrapper}>
        <IncidentVisualisationCard
          incident={incident}
          onClose={onClose}
          decade={decade}
          theme={theme}
        />

        <IncidentDescriptionCard
          incident={incident}
          incidents={incidents}
          onClose={onClose}
          currentIndex={currentIndex}
          onNavigate={onNavigate}
          decade={decade}
          theme={theme}
        />
      </div>
    </div>
  );
};

export default ThemedGalleryDisplay;
