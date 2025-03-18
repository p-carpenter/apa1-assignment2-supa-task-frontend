import React from "react";
import terminalStyles from "@/app/components/ui/console/Terminal.module.css";

/**
 * Component for rendering terminal-style prompt labels
 * Typically used in auth forms for the command-line aesthetic
 * 
 * @param {ReactNode} children - Label text content
 * @param {string} prompt - The prompt character (default: "$")
 * @param {string} className - Additional CSS class names
 */
const PromptLabel = ({ 
  children, 
  prompt = "$", 
  className = "" 
}) => {
  return (
    <>
      <span className={`${terminalStyles.prompt} ${className}`}>{prompt}</span>{" "}
      {children}
    </>
  );
};

export default PromptLabel;