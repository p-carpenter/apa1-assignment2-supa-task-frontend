import React from "react";
import WindowButtons from "./Win95WindowButtons";

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
    <div className="flex items-center justify-between bg-darkblue h-6 p-2">
      <div className="flex items-center gap-2">
        {icon && <img src={icon} className="h-4 w-4" alt="Window Icon" />}
        <p className="text-white">{title}</p>
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
