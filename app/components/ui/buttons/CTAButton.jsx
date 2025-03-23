import React from "react";
import Link from "next/link";
import styles from "./Button.module.css";

const CTAButton = ({
  href = "/gallery",
  text = "EXPLORE ARCHIVE",
  showGlow = true,
  className = "",
}) => {
  return (
    <Link href={href} className={`${styles.ctaButton} ${className}`}>
      <span>{text}</span>
      <span className={styles.entryIcon}>&#x2192;</span>
    </Link>
  );
};

export default CTAButton;
