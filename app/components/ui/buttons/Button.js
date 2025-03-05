"use client";

import React from "react";
import Link from "next/link";

/**
 * A button component for navigating to the homepage
 * @param {Object} props - Component props
 * @param {string} props.className - Additional CSS classes
 * @param {string} props.label - Button label (defaults to "BACK TO HOMEPAGE")
 * @param {string} props.icon - Button icon (defaults to "←")
 * @param {Function} props.onClick - Optional onClick handler
 */
const Button = ({
  className = "",
  href = "/",
  label = "BACK TO HOMEPAGE",
  icon = "←",
  onClick = null,
  ...props
}) => {
  return (
    <Link
      href={href}
      className={`home-button ${className}`}
      onClick={onClick}
      {...props}
    >
      <span className="home-icon">{icon}</span>
      {label}
    </Link>
  );
};

export default Button;
