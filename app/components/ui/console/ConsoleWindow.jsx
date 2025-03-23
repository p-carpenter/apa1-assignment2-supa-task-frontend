import React from "react";
import TerminalHeader from "./TerminalHeader";
import ConsoleFooter from "./ConsoleFooter";
import styles from "./Console.module.css";

/**
 * Renders a console-style window with header, content area, and footer
 * 
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Content to display in the console window
 * @param {string} props.title - Title to display in the terminal header
 * @param {Array} props.statusItems - Status items to display in the console footer
 * @returns {JSX.Element} Console window component
 */
const ConsoleWindow = ({ children, title, statusItems }) => {
  return (
    <div className={styles.consoleWindow} data-testid="console-window">
      <TerminalHeader title={title} />
      <div className={styles.consoleContent}>{children}</div>
      <ConsoleFooter statusItems={statusItems} />
    </div>
  );
};

export default ConsoleWindow;
