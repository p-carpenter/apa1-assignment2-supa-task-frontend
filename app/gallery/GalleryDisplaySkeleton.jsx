import styles from "@/app/gallery/GalleryDisplay.module.css";

const GalleryDisplaySkeleton = () => {
  return (
    <div className={styles.container}>
      <div className={styles.window}>
        <div className={styles.mainContent}>

          <div className={styles.artifactSection}>
            <div
              className={`${styles.artifactContainer} ${styles.skeletonArtifact}`}
            >
              <div className={styles.skeletonPulse}></div>
            </div>
            <div className={styles.pedestal}>
              <img
                src="/pedestal.png"
                className={styles.pedestalImage}
                alt="Pedestal"
              />
            </div>
          </div>


          <div className={styles.detailsSection}>
            <div
              className={`${styles.detailsWindow} ${styles.skeletonDetails}`}
            >
              <div className={styles.skeletonHeader}>
                <div
                  className={`${styles.skeletonBadge} ${styles.skeletonPulse}`}
                ></div>
                <div
                  className={`${styles.skeletonBadge} ${styles.skeletonPulse}`}
                ></div>
                <div
                  className={`${styles.skeletonBadge} ${styles.skeletonPulse}`}
                ></div>
              </div>
              <div
                className={`${styles.skeletonTitle} ${styles.skeletonPulse}`}
              ></div>
              <div className={styles.skeletonContent}>
                <div
                  className={`${styles.skeletonLine} ${styles.skeletonPulse}`}
                ></div>
                <div
                  className={`${styles.skeletonLine} ${styles.skeletonPulse}`}
                ></div>
                <div
                  className={`${styles.skeletonLine} ${styles.skeletonPulse}`}
                ></div>
                <div
                  className={`${styles.skeletonLine} ${styles.skeletonPulse}`}
                ></div>
                <div
                  className={`${styles.skeletonLine} ${styles.skeletonLineShort} ${styles.skeletonPulse}`}
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
