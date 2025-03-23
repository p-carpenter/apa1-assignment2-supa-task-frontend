import React, { useRef } from "react";
import { ArtifactRenderer } from "@/app/components/ui/artifacts";
import GalleryDisplaySkeleton from "@/app/gallery/GalleryDisplaySkeleton";
import { useTheme } from "@/app/contexts/ThemeContext";
import styles from "./GalleryDisplay.module.css";
import "/public/css-reskins/systemcss/systemcss.css";
import "/public/css-reskins/98css/style.css";

const GalleryDisplay = ({ incident, isLoading }) => {
  if (isLoading) {
    return <GalleryDisplaySkeleton />;
  }

  if (!incident) return null;

  const { IncidentDetailsWindows } = useTheme();
  const artifactRef = useRef(null);
  const detailsRef = useRef(null);

  return (
    <div className={styles.container}>
      <div className={styles.window}>
        <div className={styles.mainContent}>
          <div className={styles.artifactSection}>
            <div className={styles.artifactContainer} ref={artifactRef}>
              <ArtifactRenderer
                artifact={incident}
                className={styles.artifactTransparent}
              />
            </div>
            <div className={styles.pedestal}>
              <img
                src="/pedestal.png"
                className={styles.pedestalImage}
                alt="Pedestal"
              />
            </div>
          </div>

          <div className={styles.detailsSection} ref={detailsRef}>
            <div className={styles.detailsWindow}>
              <IncidentDetailsWindows incident={incident} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GalleryDisplay;
