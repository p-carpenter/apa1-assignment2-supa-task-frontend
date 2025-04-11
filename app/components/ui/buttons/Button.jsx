"use client";

import React from "react";
import Link from "next/link";
import styles from "./Button.module.css";

/**
 * Navigation button used for core navigation actions throughout the application
 *
 * @param {Object} props - Component props
 * @param {string} props.className - Additional CSS classes for custom styling scenarios
 * @param {string} props.href - Target URL for navigation
 * @param {string} props.label - Button text (defaults to "BACK TO HOMEPAGE")
 * @param {string} props.icon - Visual indicator icon (defaults to "←")
 * @param {Function} props.onClick - Optional click handler for tracking or side effects
 */
const Button = ({
  className = "",
  href = "",
  label = "BACK TO HOMEPAGE",
  icon = "←",
  onClick = null,
  ...remainingProps
}) => {
  return (
    <Link
      href={href}
      className={`${styles.button} ${className}`}
      onClick={onClick}
      {...remainingProps}
    >
      <span className={styles.icon}>{icon}</span>
      {label}
    </Link>
  );
};

export default Button;
