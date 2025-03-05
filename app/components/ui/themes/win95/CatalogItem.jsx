import React from "react";

const CatalogItem = ({
  type,
  item,
  index,
  isSelected,
  onClick,
  onDoubleClick,
  onContextMenu,
}) => {
  const baseClassNames = "flex flex-col items-center justify-center gap-1 p-2";

  const renderFolder = () => (
    <>
      <img src="/win95-folder-icon.png" className="w-8 h-8" />
      <p>{item.name}</p>
      <p className="text-xs text-gray-500">{item.incidentCount} incidents</p>
    </>
  );

  const renderIncident = () => (
    <>
      <div className="casefile">
        <img src="/computer.png" className="w-12 h-12" />
        <div
          className={`absolute bottom-0 right-0 w-3 h-3 rounded-full ${item.severity.toLowerCase()}`}
        />
      </div>
      <p className="text-pretty max-w-32 break-words">
              {item.name}.inc
      </p>
      <p className="text-xs bg-gray-300 px-2 category-label">{item.category}</p>
    </>
  );

  return (
    <div
      id={`${type}-${index}`}
      className={`${baseClassNames} ${
        type === "folder"
          ? isSelected
            ? "selected"
            : ""
          : `case-container ${isSelected ? "selected" : ""}`
      }`}
      style={{ position: "relative" }}
      onClick={onClick}
      onDoubleClick={onDoubleClick}
      onContextMenu={onContextMenu}
    >
      {type === "folder" ? renderFolder() : renderIncident()}
    </div>
  );
};

export default CatalogItem;
