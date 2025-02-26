import React from "react";

const DOSPanel = ({ title, children, className = "" }) => {
  return (
    <div
      className={`flex flex-col border-4 border-double border-[#00ffff] ${className}`}
    >
      <div className="relative bg-[#00ffff] text-[#0000aa] text-center font-bold h-6">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 bg-[#00ffff] px-2 z-10">
          {title}
        </div>
        <div className="absolute top-1/2 left-0 right-0 h-1 bg-[#00ffff] z-0"></div>
      </div>
      <div className="flex-1 bg-[#0000aa] text-[#ffff00]">{children}</div>
    </div>
  );
};

export default DOSPanel;
