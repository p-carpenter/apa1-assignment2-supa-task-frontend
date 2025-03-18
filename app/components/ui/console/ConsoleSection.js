import React from "react";
import CommandLine from "./CommandLine";
import styles from "./Console.module.css";

const ConsoleSection = ({
  command,
  commandParts,
  customPrompt,
  className = "",
  children,
}) => {
  return (
    <div className={`${styles.consoleSection} ${className}`}>
      {command && (
        <CommandLine
          command={command}
          commandParts={commandParts}
          customPrompt={customPrompt}
        />
      )}
      {children}
    </div>
  );
};

export default ConsoleSection;
