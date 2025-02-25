import React from "react";

const IncidentCard = ({
  entry,
  index,
  isSelected,
  onClick,
  onDoubleClick,
  onContextMenu,
}) => {
  return (
    <div
      id={`incident-${index}`}
      className={`case-container ${isSelected ? "selected" : ""}`}
      style={{ position: "relative" }}
      onClick={onClick}
      onDoubleClick={onDoubleClick}
      onContextMenu={onContextMenu}
    >
      <div className="casefile">
        <img src="/computer.png" className="w-12 h-12" />
        <div
          className={`absolute bottom-0 right-0 w-3 h-3 rounded-full ${entry.severity.toLowerCase()}`}
        />
      </div>
      <p>{entry.name}</p>
      <p className="text-xs bg-gray-300 px-2 category-label">
        {entry.category}
      </p>
    </div>
  );
};

export default IncidentCard;
