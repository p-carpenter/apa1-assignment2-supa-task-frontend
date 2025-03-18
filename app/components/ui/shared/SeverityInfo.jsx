import React from 'react';
import styles from './SeverityInfo.module.css';

/**
 * SeverityInfo component
 * Displays information about severity levels
 */
const SeverityInfo = ({ onClose }) => {
  return (
    <div className={styles.infoPanel}>
      <div className={styles.infoHeader}>
        <strong>Severity</strong>
        <button
          onClick={onClose}
          className={styles.closeButton}
          type="button"
        >
          Close
        </button>
      </div>
      <div className={styles.infoGrid}>
        <div className={styles.levelName}>Low:</div>
        <div className={styles.levelDescription}>
          Minor/localized impact, quickly resolved, little disruption.
        </div>

        <div className={styles.levelName}>Moderate:</div>
        <div className={styles.levelDescription}>
          Noticeable disruption, but limited in scale or duration.
        </div>

        <div className={styles.levelName}>High:</div>
        <div className={styles.levelDescription}>
          Widespread impact, major disruptions, difficult recovery.
        </div>

        <div className={styles.levelName}>Critical:</div>
        <div className={styles.levelDescription}>
          Catastrophic failure with long-term consequences.
        </div>
      </div>
    </div>
  );
};

export default SeverityInfo;