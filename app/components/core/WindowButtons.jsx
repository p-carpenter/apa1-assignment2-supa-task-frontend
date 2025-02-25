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
    <div className="flex gap-1">
      <div className="flex">
        {showMinimize && (
          <div className="window-button win95-button" onClick={onMinimize}>
            <div className="w-1.5 h-0.5 bg-black relative top-1 rounded-xs"></div>
          </div>
        )}
        {showMaximize && (
          <div className="window-button win95-button" onClick={onMaximize}>
            <div className="w-2 h-2 border border-black border-t-2"></div>
          </div>
        )}
      </div>
      {showClose && (
        <div className="window-button win95-button" onClick={onClose}>
          <div className="relative w-2 h-2">
            <div className="absolute w-2 h-[1.5px] bg-black rotate-45 top-1/2 -translate-y-1/2 rounded-xs"></div>
            <div className="absolute w-2 h-[1.5px] bg-black -rotate-45 top-1/2 -translate-y-1/2 rounded-xs"></div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WindowButtons;
