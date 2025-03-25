import React from "react";
import terminalStyles from "@/app/components/ui/console/Terminal.module.css";

/**
 * Renders a command prompt label with a '$' character preceding any children
 * Used to create a terminal-like input presentation in the UI
 *
 * @param {ReactNode} props.children - The content to display after the prompt symbol
 */
const PromptLabel = ({ children }) => {
  return (
    <>
      <span className={terminalStyles.prompt}>$</span> {children}
    </>
  );
};

export default PromptLabel;
