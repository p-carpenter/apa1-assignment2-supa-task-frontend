import React from 'react';

const Illustrations = ({ illustrations = [] }) => {
  // If no illustrations provided, use default ones
  const defaultIllustrations = [
    { className: "y2k", tooltip: "Y2K Bug (2000)" },
    { className: "challenger", tooltip: "Challenger Disaster (1986)" },
    { className: "morris", tooltip: "Morris Worm (1988)" },
    { className: "therac", tooltip: "Therac-25 (1985-87)" }
  ];

  const items = illustrations.length > 0 ? illustrations : defaultIllustrations;

  return (
    <div className="console-illustrations">
      {items.map((item, index) => (
        <div
          key={index}
          className={`illustration-item ${item.className}`}
          data-tooltip={item.tooltip}
        ></div>
      ))}
    </div>
  );
};

export default Illustrations;
