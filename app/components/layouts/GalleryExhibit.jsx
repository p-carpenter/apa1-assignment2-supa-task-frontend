import React, { useMemo, useRef } from "react";
import ArtifactRenderer from "@/app/components/ui/artifacts/ArtifactRenderer";
import { useTheme } from "@/app/contexts/ThemeContext";
import styles from "./GalleryExhibit.module.css";
import "/public/css-reskins/systemcss/systemcss.css";
import "/public/css-reskins/98css/style.css";

const GalleryExhibitSkeleton = () => {
  return (
    <div className={styles.container}>
      <div className={styles.window}>
        <img
          src="/wall.jpg"
          className={styles.background_image}
          alt="Background"
        />
        <div className={styles.main_content}>
          {/* Artifact skeleton */}
          <div className={styles.artifact_section}>
            <div className={`${styles.artifact_container} ${styles.skeleton_artifact}`}>
              <div className={styles.skeleton_pulse}></div>
            </div>
            <div className={styles.pedestal}>
              <img
                src="/pedestal.png"
                className={styles.pedestal_image}
                alt="Pedestal"
              />
            </div>
          </div>

          {/* Details skeleton */}
          <div className={styles.details_section}>
            <div className={`${styles.details_window} ${styles.skeleton_details}`}>
              <div className={styles.skeleton_header}>
                <div className={`${styles.skeleton_badge} ${styles.skeleton_pulse}`}></div>
                <div className={`${styles.skeleton_badge} ${styles.skeleton_pulse}`}></div>
                <div className={`${styles.skeleton_badge} ${styles.skeleton_pulse}`}></div>
              </div>
              <div className={`${styles.skeleton_title} ${styles.skeleton_pulse}`}></div>
              <div className={styles.skeleton_content}>
                <div className={`${styles.skeleton_line} ${styles.skeleton_pulse}`}></div>
                <div className={`${styles.skeleton_line} ${styles.skeleton_pulse}`}></div>
                <div className={`${styles.skeleton_line} ${styles.skeleton_pulse}`}></div>
                <div className={`${styles.skeleton_line} ${styles.skeleton_pulse}`}></div>
                <div className={`${styles.skeleton_line} ${styles.skeleton_line_short} ${styles.skeleton_pulse}`}></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

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

  const hasArtifactContent = useMemo(() => {
    return incident && incident.artifactType && incident.artifactContent;
  }, [incident]);

  return (
    <div className={styles.container}>
      <div className={styles.window}>
        {/* Background image */}
        <img
          src="/wall.jpg"
          className={styles.background_image}
          alt="Background"
        />
        <div className={styles.main_content}>
          {/* Artifact section */}
          <div className={styles.artifact_section}>
            <div className={styles.artifact_container} ref={artifactRef}>
              <ArtifactRenderer
                artifact={incident}
                className={styles.artifact_transparent}
                paddingSize={paddingSize}
                maxWidth={hasArtifactContent ? undefined : 400}
                maxHeight={350} // Fixed height to ensure consistency
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

          {/* Details section with decade-specific component */}
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
