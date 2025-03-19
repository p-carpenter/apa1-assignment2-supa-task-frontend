import styles from "./GalleryDisplay.module.css";

const GalleryDisplaySkeleton = () => {
  return (
    <div className={styles.container}>
      <div className={styles.window}>
        <div className={styles.main_content}>
          {/* Artifact skeleton */}
          <div className={styles.artifact_section}>
            <div
              className={`${styles.artifact_container} ${styles.skeleton_artifact}`}
            >
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
            <div
              className={`${styles.details_window} ${styles.skeleton_details}`}
            >
              <div className={styles.skeleton_header}>
                <div
                  className={`${styles.skeleton_badge} ${styles.skeleton_pulse}`}
                ></div>
                <div
                  className={`${styles.skeleton_badge} ${styles.skeleton_pulse}`}
                ></div>
                <div
                  className={`${styles.skeleton_badge} ${styles.skeleton_pulse}`}
                ></div>
              </div>
              <div
                className={`${styles.skeleton_title} ${styles.skeleton_pulse}`}
              ></div>
              <div className={styles.skeleton_content}>
                <div
                  className={`${styles.skeleton_line} ${styles.skeleton_pulse}`}
                ></div>
                <div
                  className={`${styles.skeleton_line} ${styles.skeleton_pulse}`}
                ></div>
                <div
                  className={`${styles.skeleton_line} ${styles.skeleton_pulse}`}
                ></div>
                <div
                  className={`${styles.skeleton_line} ${styles.skeleton_pulse}`}
                ></div>
                <div
                  className={`${styles.skeleton_line} ${styles.skeleton_line_short} ${styles.skeleton_pulse}`}
                ></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GalleryDisplaySkeleton;
