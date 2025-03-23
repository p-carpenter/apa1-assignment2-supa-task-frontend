"use client";
import React from "react";
import { useAuth } from "../../../contexts/AuthContext";
import styles from "./Terminal.module.css";

const CommandLine = ({
  command = "", // The main command string
  commandParts = null, // Optional object to define parts to highlight
  customPrompt = null, // Optional custom prompt to override default
}) => {
  const { user } = useAuth();
  const username = user?.displayName || user?.email?.split("@")[0] || "guest";
  const prompt = customPrompt || `${username}@archive:~$`;

  if (!commandParts) {
    return (
      <div className={styles.commandLine}>
        <span className={styles.prompt}>{prompt}</span>
        <span className={styles.command}>{command}</span>
      </div>
    );
  }

  // If commandParts is provided, parse it for syntax highlighting
  const {
    baseCommand, // The first word of the command (e.g., "query", "security", "load")
    args = [], // Regular arguments like "tech_incidents.db"
    flags = [], // Flags with -- prefix like "--search" or "--profile"
  } = commandParts;

  return (
    <div className={styles.commandLine}>
      <span className={styles.prompt}>{prompt}</span>

      {/* Base command gets special styling */}
      {baseCommand && <span className={styles.command}>{baseCommand}</span>}

      {/* Regular arguments */}
      {args.map((arg, index) => (
        <span key={`arg-${index}`} className={styles.argument}>
          {arg}
        </span>
      ))}

      {/* Flags with -- prefix */}
      {flags.map((flag, index) => (
        <span key={`flag-${index}`} className={styles.parameter}>
          {flag}
        </span>
      ))}
    </div>
  );
};

export default CommandLine;
