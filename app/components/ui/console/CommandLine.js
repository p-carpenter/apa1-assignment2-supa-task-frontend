"use client";
import React from "react";
import { useAuth } from '../../../contexts/AuthContext';

const CommandLine = ({ 
  command = "", // The main command string
  commandParts = null, // Optional object to define parts to highlight
  customPrompt = null // Optional custom prompt to override default 
}) => {
  const { user } = useAuth();
  const username = user?.displayName || user?.email?.split('@')[0] || 'guest';
  const prompt = customPrompt || `${username}@archive:~$`;

  // Flexbox container style
  const flexStyle = {
    display: 'flex',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: '0.5rem',
    alignItems: 'center'
  };

  // If commandParts is not provided, just render the command as a whole
  if (!commandParts) {
    return (
      <div className="command-line">
        <span className="prompt">{prompt}</span>
        <span className="command">{command}</span>
      </div>
    );
  }

  // If commandParts is provided, parse it for syntax highlighting
  const { 
    baseCommand, // The first word of the command (e.g., "query", "security", "load")
    args = [],   // Regular arguments like "tech_incidents.db" 
    flags = []   // Flags with -- prefix like "--search" or "--profile"
  } = commandParts;

  return (
    <div className="command-line" style={flexStyle}>
      <span className="prompt">{prompt}</span>
      
      {/* Base command gets special styling */}
      {baseCommand && <span className="command">{baseCommand}</span>}
      
      {/* Regular arguments */}
      {args.map((arg, index) => (
        <span key={`arg-${index}`} className="argument">{arg}</span>
      ))}
      
      {/* Flags with -- prefix */}
      {flags.map((flag, index) => (
        <span key={`flag-${index}`} className="parameter">{flag}</span>
      ))}
    </div>
  );
};

export default CommandLine;