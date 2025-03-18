import React from "react";
import styles from "@/app/Homepage.module.css";

const MuseumInfo = () => {
  return (
    <div className={styles.museumInfo}>
      <h3 className={styles.museumHeader}>
        The Digital Archive of Technology's Worst Moments
      </h3>
      <p className={styles.museumDescription}>
        A collection of significant technical failures and their impact on
        modern computing safety standards.
      </p>
      <div className={styles.contributionNote}>
        <p>
          This is an educational resource documenting technological incidents
          that shaped our industry.
        </p>
        <div className={styles.contributionLink}>
          <button className={styles.textButton}>
            Contribute to the Archive
          </button>
        </div>
      </div>
    </div>
  );
};

export default MuseumInfo;
