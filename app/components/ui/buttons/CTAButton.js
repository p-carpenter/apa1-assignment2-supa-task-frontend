import React from "react";
import Link from "next/link";

const CTAButton = ({
  href = "/gallery",
  text = "EXPLORE ARCHIVE",
  showGlow = true,
  className = "",
}) => {
  return (
    <Link href={href} className={`console-button ${className}`}>
      {showGlow && <div className="button-glow"></div>}
      <span className="button-text">{text}</span>
      <span className="entry-icon">&#x2192;</span>
    </Link>
  );
};

export default CTAButton;
