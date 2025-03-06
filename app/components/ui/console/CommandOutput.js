import React from 'react';

const CommandOutput = ({ children, title, subtitle, showGlitch = true, showLoadingBar = false }) => {
  return (
    <>
    <h1 className="archive-title">
        {showGlitch ? (
          <span className="title-glitch" data-text={title}>
            {title}
          </span>
        ) : (
          title
        )}
        <span className="cursor"></span>
      </h1>
    {subtitle && <h2 className="archive-subtitle">{subtitle}</h2>}
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
    </>
  );
};

export default CommandOutput;
