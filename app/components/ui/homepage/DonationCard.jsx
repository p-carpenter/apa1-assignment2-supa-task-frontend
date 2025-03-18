import React from "react";
import styles from "@/app/Homepage.module.css";

const DonationCard = ({
  dismissButtonText = "Maybe Later",
  dismissButtonClass = "dismiss",
  onDismissClick,
}) => {
  return (
    <div className={styles.wikiAppeal}>
      <div className={styles.appealHeading}>
        <div className={styles.appealIcon}>?</div>
        From the Tech Incidents Archive Museum
      </div>

      <div className={styles.appealText}>
        <p>Dear reader, we need your support to keep this archive free.</p>
        <p>
          The Tech Incidents Archive is dedicated to preserving the history of
          technology's most impactful failures. We rely on donations to maintain
          our servers and continue expanding our collection.
        </p>
        <p>Please consider making a donation today.</p>
        <p>— The Archive Team</p>
      </div>

      <div className={styles.appealProgress}>
        <div className={styles.progressBar}>
          <div className={styles.progressFill}></div>
        </div>
        <div className={styles.progressText}>
          <span className={styles.progressPercent}>140%</span> of our £100,000
          goal
        </div>
      </div>

      <div className={styles.appealButtons}>
        <button
          className={`${styles.wikiButton} ${styles[dismissButtonClass]}`}
          onClick={onDismissClick}
        >
          {dismissButtonText}
        </button>
        <button className={`${styles.wikiButton} ${styles.signup}`}>
          Support the Archive
        </button>
      </div>
    </div>
  );
};

export default DonationCard;
