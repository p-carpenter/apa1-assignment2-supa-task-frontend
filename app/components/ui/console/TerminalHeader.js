import React from 'react';

const TerminalHeader = ({ title = 'tech-incidents-catalog', showAuthControls = true }) => {
  return (
    <div className="terminal-header">
      <span className="terminal-dot"></span>
      <span className="terminal-dot"></span>
      <span className="terminal-dot"></span>
      <div className="terminal-title">{title}</div>
      {showAuthControls && (
        <div className="auth-controls">
          <button className="auth-button login">Log In</button>
          <button className="auth-button signup">Sign Up</button>
        </div>
      )}
    </div>
  );
};

export default TerminalHeader;
