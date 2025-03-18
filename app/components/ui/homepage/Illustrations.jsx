import React from "react";
import styles from "@/app/Homepage.module.css";

const Illustrations = () => {
  return (
    <div className={styles.consoleIllustrations}>
      <div
        className={`${styles.illustrationItem} ${styles.y2k}`}
        data-tooltip="Y2K Bug"
      />
      <div
        className={`${styles.illustrationItem} ${styles.challenger}`}
        data-tooltip="Challenger Disaster"
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
