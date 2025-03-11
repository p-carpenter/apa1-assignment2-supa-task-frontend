import React from 'react';
import CommandLine from './CommandLine';

const ConsoleSection = ({ 
  command, 
  commandParts,
  customPrompt,
  className = '', 
  children 
}) => {
  return (
    <div className={`console-section ${className}`}>
      {command && <CommandLine 
        command={command} 
        commandParts={commandParts}
        customPrompt={customPrompt}
      />}
      {children}
    </div>
  );
};

export default ConsoleSection;