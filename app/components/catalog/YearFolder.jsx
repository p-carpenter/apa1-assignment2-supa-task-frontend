import React from "react";

const YearFolder = ({ year, incidentCount, index, onDoubleClick }) => {
  return (
    <div
      id={`folder-${index}`}
      className="flex flex-col items-center justify-center gap-1 p-2 cursor-pointer hover:bg-blue-100"
      onDoubleClick={onDoubleClick}
    >
      <img src="/win95-folder-icon.png" className="w-8 h-8" />
      <p>{year}</p>
      <p className="text-xs text-gray-500">{incidentCount} incidents</p>
    </div>
  );
};

export default YearFolder;
