import React from "react";

const WindowButtons = ({
  showMinimize = true,
  showMaximize = true,
  showClose = true,
  onMinimize,
  onMaximize,
  onClose,
}) => {
  return (
    <div className="window-buttons">
      {showMinimize && <div id="min-button" onClick={onMinimize} />}
      {showMaximize && <div id="max-button" onClick={onMaximize} />}
      {showClose && <div id="close-button" onClick={onClose} />}
    </div>
  );
};

export default WindowButtons;
