// components/common/StandardArtifact.jsx
import React, { useState } from "react";
import "./StandardArtifact.css";

const StandardArtifact = ({
  children,
  decade,
  title,
  date,
  expandedWidth = 1200,
  className = "",
}) => {
  const [expanded, setExpanded] = useState(false);

  return (
    <div
      className={`standard-artifact decade-${decade} ${expanded ? "expanded" : ""} ${className}`}
      style={{
        width: expanded ? `${expandedWidth}px` : "1024px",
      }}
    >
      <div className="standard-artifact-content">{children}</div>
    </div>
  );
};

export default StandardArtifact;
