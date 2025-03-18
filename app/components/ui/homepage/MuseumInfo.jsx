import React from "react";
import styles from "@/app/Homepage.module.css";
import { useAuth } from "@/app/contexts/AuthContext";

const MuseumInfo = () => {
  const { isAuthenticated } = useAuth();

  return (
    <div className={styles.museumInfo}>
      <h3 className={styles.museumHeader}>
        What is the Tech Incidents Archive?
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
