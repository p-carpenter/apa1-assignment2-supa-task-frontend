import React from "react";
import styles from "@/app/Homepage.module.css";

/**
 * Renders decorative illustrations of famous technological incidents
 * Displays a collection of historical tech disasters with tooltips
 * Used primarily on the homepage to visually represent some of the archive's content
 */
const Illustrations = () => {
  return (
    <div className={styles.consoleIllustrations}>
      <div
        className={`${styles.illustrationItem} ${styles.y2k}`}
        data-tooltip="Y2K Bug"
      />
      <div
        className={`${styles.illustrationItem} ${styles.morris}`}
        data-tooltip="Morris Worm"
      />
      <div
        className={`${styles.illustrationItem} ${styles.therac}`}
        data-tooltip="Therac-25"
      />
    </div>
  );
};

export default Illustrations;
