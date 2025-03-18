import React from "react";
import TerminalHeader from "./TerminalHeader";
import ConsoleFooter from "./ConsoleFooter";
import styles from "./Console.module.css";

const ConsoleWindow = ({ children, title, statusItems }) => {
  return (
    <div className={styles.consoleWindow}>
      <TerminalHeader title={title} />
      <div className={styles.consoleContent}>{children}</div>
      <ConsoleFooter statusItems={statusItems} />
    </div>
  );
};

export default ConsoleWindow;
