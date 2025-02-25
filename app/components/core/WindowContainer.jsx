import React from "react";

const WindowContainer = ({
  className,
  onMouseDown,
  onMouseMove,
  onMouseUp,
  onContextMenu,
  children,
}) => {
  return (
    <div
      className={`explorer-container h-[80vh] w-[75vw] shadow-win95 ${className}`}
      style={{
        userSelect: "none",
        position: "relative",
      }}
      onMouseDown={onMouseDown}
      onMouseMove={onMouseMove}
      onMouseUp={onMouseUp}
      onContextMenu={onContextMenu}
    >
      {children}
    </div>
  );
};

export default WindowContainer;
