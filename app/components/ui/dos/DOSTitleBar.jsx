import React from "react";

const DOSTitleBar = ({ title, onClose }) => {
  return (
    <div className="relative bg-[#00ffff] text-[#0000aa] text-center font-bold h-6">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 bg-[#00ffff] px-2 z-10">
        {title}
      </div>
      <div className="absolute top-1/2 left-0 right-0 h-1 bg-[#00ffff] z-0"></div>
      {onClose && (
        <button
          onClick={onClose}
          className="absolute right-1 top-0 text-[#0000aa] hover:text-blue-900"
        >
          X
        </button>
      )}
    </div>
  );
};

export default DOSTitleBar;
