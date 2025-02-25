import React from "react";
import WindowButtons from "./WindowButtons";

const TitleBar = ({
  title,
  icon,
  onMinimize,
  onMaximize,
  onClose,
  showClose,
  showMaximize,
  showMinimize,
}) => {
  return (
    <div className="explorer-window-bar">
      <div className="folder-name">
        <img src={icon} alt="Window Icon" />
        <p>{title}</p>
      </div>
      <WindowButtons
        showMinimize={showMinimize}
        showMaximize={showMaximize}
        showClose={showClose}
        onMinimize={onMinimize}
        onMaximize={onMaximize}
        onClose={onClose}
      />
    </div>
  );
};

export default TitleBar;
