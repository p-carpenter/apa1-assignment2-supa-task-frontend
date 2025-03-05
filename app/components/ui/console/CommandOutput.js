import React from 'react';

const CommandOutput = ({ children, showLoadingBar = false }) => {
  return (
    <div className="command-output">
      {showLoadingBar && (
        <div className="loading-bar">
          <div className="loading-progress"></div>
        </div>
      )}
      <div className="output-text">
        {children}
      </div>
    </div>
  );
};

export default CommandOutput;
