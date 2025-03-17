import React, { useMemo, useRef } from "react";
import ArtifactRenderer from "@/app/components/ui/artifacts/ArtifactRenderer";
import GalleryExhibitSkeleton from "./GalleryExhibitSkeleton";
import { useTheme } from "@/app/contexts/ThemeContext";
import styles from "./GalleryExhibit.module.css";
import "/public/css-reskins/systemcss/systemcss.css";
import "/public/css-reskins/98css/style.css";

const GalleryExhibit = ({ incident, isLoading }) => {
  if (isLoading) {
    return <GalleryExhibitSkeleton />;
  }

  if (!incident) return null;

  const { getPaddingSizeForArtifact, IncidentDetailsWindows } = useTheme();
  const artifactRef = useRef(null);
  const detailsRef = useRef(null);

  const paddingSize = useMemo(() => {
    return getPaddingSizeForArtifact(incident);
  }, [incident, getPaddingSizeForArtifact]);

  return (
    <div className={styles.container}>
      <div className={styles.window}>
        <div className={styles.main_content}>
          {/* Artifact section */}
          <div className={styles.artifact_section}>
            <div className={styles.artifact_container} ref={artifactRef}>
              <ArtifactRenderer
                artifact={incident}
                className={styles.artifact_transparent}
                paddingSize={paddingSize}
              />
            </div>
            <div className={styles.pedestal}>
              <img
                src="/pedestal.png"
                className={styles.pedestal_image}
                alt="Pedestal"
              />
            </div>
          </div>

          {/* Details section */}
          <div className={styles.details_section} ref={detailsRef}>
            <div className={styles.details_window}>
              <IncidentDetailsWindows incident={incident} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GalleryExhibit;
