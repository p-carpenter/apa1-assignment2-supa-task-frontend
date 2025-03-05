import React from "react";

const DOSPanel = ({ title, children, className = "", position = "left" }) => {
  // Ensure position is either "left" or "right", defaulting to "left"
  const validPosition = ["left", "right"].includes(position)
    ? position
    : "left";

  return (
    <div className={`dos-panel ${className}`}>
      <div className="dos-panel__title">
        <div className={`dos-panel__title-text ${validPosition}`}>{title}</div>
        <div className="dos-panel__title-line-left"></div>
        <div className="dos-panel__title-line-right"></div>
      </div>
      <div className="dos-panel__content">{children}</div>
    </div>
  );
};

export default DOSPanel;
