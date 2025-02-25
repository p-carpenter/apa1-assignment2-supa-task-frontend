import React from "react";

const SelectionBox = ({ isSelecting, selectionBox }) => {
  if (!isSelecting) return null;

  return (
    <div
      style={{
        position: "absolute",
        border: "1px dashed black",
        background: "transparent",
        left: selectionBox.x,
        top: selectionBox.y,
        width: selectionBox.width,
        height: selectionBox.height,
        pointerEvents: "none",
      }}
    />
  );
};

export default SelectionBox;
