import React from "react";
import CommandLine from "./CommandLine";
import styles from "./Console.module.css";

/**
 * Renders a section in the console with an optional command line and content
 *
 * @param {Object} props - Component props
 * @param {string} [props.command] - Command text to display in the command line
 * @param {Object} [props.commandParts] - Parts of the command for syntax highlighting
 * @param {string} [props.commandParts.baseCommand] - The base command portion
 * @param {Array<string>} [props.commandParts.args] - Command arguments
 * @param {Array<string>} [props.commandParts.flags] - Command flags
 * @param {string} [props.customPrompt] - Custom prompt text to display
 * @param {string} [props.className=""] - Additional CSS class
 * @param {React.ReactNode} props.children - Content to display in the console section
 */
const ConsoleSection = ({
  command,
  commandParts,
  customPrompt,
  className = "",
  children,
}) => {
  return (
    <div
      className={`${styles.consoleSection} ${className}`}
      data-testid="console-section"
    >
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
