import React from "react";
import Link from "next/link";
import styles from "./Button.module.css";

/**
 * Call-to-action button component with arrow icon used for primary user actions and navigation flows
 *
 * @param {string} href - Target URL for navigation
 * @param {string} text - Button text content
 * @param {boolean} showGlow - Whether to show the glow effect
 * @param {string} className - Additional CSS class names
 */
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
