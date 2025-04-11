"use client";
import React from "react";
import { useAuth } from "../../../contexts/AuthContext";
import styles from "./Terminal.module.css";

/**
 * Renders a command line in the terminal with optional syntax highlighting
 *
 * @param {Object} props - Component props
 * @param {string} [props.command=""] - The full command string
 * @param {Object} [props.commandParts=null] - Optional object to define parts for syntax highlighting
 * @param {string} [props.commandParts.baseCommand] - The base command portion (first word)
 * @param {Array<string>} [props.commandParts.args=[]] - Command arguments
 * @param {Array<string>} [props.commandParts.flags=[]] - Command flags with -- prefix
 * @param {string} [props.customPrompt=null] - Optional custom prompt to override default
 */
const CommandLine = ({
  command = "",
  commandParts = null,
  customPrompt = null,
}) => {
  const { user } = useAuth();
  const username = extractUsername(user);
  const prompt = customPrompt || `${username}@archive:~$`;

  // If no command parts provided, render simple command line
  if (!commandParts) {
    return renderSimpleCommandLine(prompt, command);
  }

  // With command parts, render syntax-highlighted command line
  return renderHighlightedCommandLine(prompt, commandParts);
};

/**
 * Extracts a username from the user object
 *
 * @param {Object|null} user - The user object from auth context
 * @returns {string} Username or "guest" if not available
 */
const extractUsername = (user) => {
  if (!user) return "guest";
  return user.displayName || user.email?.split("@")[0] || "guest";
};

/**
 * Renders a simple command line without syntax highlighting
 *
 * @param {string} prompt - The prompt text
 * @param {string} command - The command text
 */
const renderSimpleCommandLine = (prompt, command) => {
  return (
    <div className={styles.commandLine}>
      <span className={styles.prompt}>{prompt}</span>
      <span className={styles.command}>{command}</span>
    </div>
  );
};

/**
 * Renders a command line with syntax highlighting
 *
 * @param {string} prompt - The prompt text
 * @param {Object} commandParts - Parts of the command for syntax highlighting
 */
const renderHighlightedCommandLine = (prompt, commandParts) => {
  const { baseCommand, args = [], flags = [] } = commandParts;

  return (
    <div className={styles.commandLine}>
      <span className={styles.prompt}>{prompt}</span>

      {/* Base command gets special styling */}
      {baseCommand && <span className={styles.command}>{baseCommand}</span>}

      {/* Regular arguments */}
      {args.map((arg, index) => (
        <span key={`arg-${index}`} className={styles.argument}>
          {" "}
          {arg}
        </span>
      ))}

      {/* Flags with -- prefix */}
      {flags.map((flag, index) => (
        <span key={`flag-${index}`} className={styles.parameter}>
          {" "}
          {flag}
        </span>
      ))}
    </div>
  );
};

export default CommandLine;
