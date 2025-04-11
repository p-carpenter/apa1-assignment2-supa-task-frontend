import React from "react";
import styles from "@/app/Homepage.module.css";
import { useAuth } from "@/app/contexts/AuthContext";

/**
 * Displays formatted information about the incident archive/museum
 * Includes a title, description, and link to the registration page
 */
const MuseumInfo = () => {
  const { isAuthenticated } = useAuth();

  return (
    <div className={styles.museumInfo}>
      <h3 className={styles.museumHeader}>
        What is the Tech Incidents Archive?
      </h3>
      <p className={styles.museumDescription}>
        A collection of significant technical failures and their impact.
      </p>
      <div className={styles.contributionNote}>
        <p>
          This is an educational resource documenting technological incidents
          that shaped our industry.
        </p>
        <div className={styles.contributionLink}>
          <a
            className={styles.textButton}
            href={isAuthenticated ? "/catalog" : "/signup"}
          >
            Contribute to the Archive
          </a>
        </div>
      </div>
    </div>
  );
};

export default MuseumInfo;
