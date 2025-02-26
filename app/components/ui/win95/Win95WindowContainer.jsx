import React, { forwardRef } from "react";

const WindowContainer = forwardRef(
  (
    { className, onMouseDown, onMouseMove, onMouseUp, onContextMenu, children },
    ref
  ) => {
    return (
      <div
        ref={ref}
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
  }
);

export default WindowContainer;
