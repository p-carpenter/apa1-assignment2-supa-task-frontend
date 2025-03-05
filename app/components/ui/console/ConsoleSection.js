import React from 'react';
import CommandLine from './CommandLine';

const ConsoleSection = ({ command, className = '', children }) => {
  return (
    <div className={`console-section ${className}`}>
      {command && <CommandLine command={command} />}
      {children}
    </div>
  );
};

export default ConsoleSection;
