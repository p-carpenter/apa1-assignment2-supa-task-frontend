import React from 'react';

const CommandLine = ({ command }) => {
  return (
    <div className="command-line">
      <span className="prompt">user@archive:~$</span>
      <span className="command">{command}</span>
    </div>
  );
};

export default CommandLine;
