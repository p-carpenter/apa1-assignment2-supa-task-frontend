import React, { useMemo, useRef, useState, useEffect } from "react";
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

  const [slideDirection, setSlideDirection] = useState("");
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [prevIncident, setPrevIncident] = useState(null);

  useEffect(() => {
    if (incident && prevIncident && incident.id !== prevIncident.id) {
      // Determine slide direction based on incident IDs or other logic
      const direction = incident.id > prevIncident.id ? "next" : "prev";
      setSlideDirection(direction);
      setIsTransitioning(true);

      const timer = setTimeout(() => {
        setIsTransitioning(false);
      }, 300); // Match this with your CSS transition duration

      return () => clearTimeout(timer);
    }

    setPrevIncident(incident);
  }, [incident, prevIncident]);

  if (!incident) return null;

  const { getPaddingSizeForArtifact, IncidentDetailsWindows } = useTheme();
  const artifactRef = useRef(null);
  const detailsRef = useRef(null);

  const paddingSize = useMemo(() => {
    return getPaddingSizeForArtifact(incident);
  }, [incident, getPaddingSizeForArtifact]);

  const hasArtifactContent = useMemo(() => {
    return incident && incident.artifactType && incident.artifactContent;
  }, [incident]);

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
