import React from 'react';

const ConsoleFooter = ({ statusItems = [] }) => {
  if (!statusItems.length) {
    statusItems = [
      "TECH INCIDENTS DATABASE",
      "CATALOG VIEW",
      { text: "0 RECORDS RETRIEVED", blink: true }
    ];
  }

  return (
    <div className="console-footer">
      {statusItems.map((item, index) => {
        // Handle both string and object formats
        if (typeof item === 'string') {
          return <div key={index} className="status-item">{item}</div>;
        } else {
          return (
            <div 
              key={index} 
              className={`status-item ${item.blink ? 'blink-slow' : ''}`}
            >
              {item.text}
            </div>
          );
        }
      })}
    </div>
  );
};

export default ConsoleFooter;
