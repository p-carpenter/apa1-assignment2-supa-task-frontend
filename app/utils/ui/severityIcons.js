import React from 'react';

/**
 * Get SVG icon for a specific severity level
 * @param {number} severity - Severity level (1-3)
 * @returns {JSX.Element} - SVG icon component
 */
export const getSeverityIcon = (severity = 0) => {
  // Normalize severity to 0-3 range
  const level = typeof severity === 'number' ? 
    Math.min(Math.max(Math.round(severity), 0), 3) : 0;
  
  switch(level) {
    case 1:
      return (
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          width="16" 
          height="16" 
          viewBox="0 0 16 16" 
          className="severity-icon severity-low"
        >
          <path 
            d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0-1.5a5.5 5.5 0 1 0 0-11 5.5 5.5 0 0 0 0 11z" 
            fill="currentColor"
          />
          <path 
            d="M8 5a1 1 0 0 1 1 1v3a1 1 0 1 1-2 0V6a1 1 0 0 1 1-1z" 
            fill="currentColor"
          />
          <circle cx="8" cy="11" r="1" fill="currentColor" />
        </svg>
      );
    case 2:
      return (
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          width="16" 
          height="16" 
          viewBox="0 0 16 16" 
          className="severity-icon severity-medium"
        >
          <path 
            d="M1.5 14.5L8 2l6.5 12.5H1.5z" 
            stroke="currentColor" 
            strokeWidth="1.5" 
            fill="none"
          />
          <path 
            d="M8 6.5v3" 
            stroke="currentColor" 
            strokeWidth="1.5" 
            strokeLinecap="round"
          />
          <circle cx="8" cy="11.5" r="1" fill="currentColor" />
        </svg>
      );
    case 3:
      return (
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          width="16" 
          height="16" 
          viewBox="0 0 16 16" 
          className="severity-icon severity-high"
        >
          <path 
            d="M7.5 1h1v9h-1z" 
            fill="currentColor"
          />
          <path 
            d="M8 15a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3z" 
            fill="currentColor"
          />
          <path 
            d="M6 4l-4 2 2-4 2 2zM10 4l4 2-2-4-2 2z" 
            fill="currentColor"
          />
        </svg>
      );
    default:
      return (
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          width="16" 
          height="16" 
          viewBox="0 0 16 16" 
          className="severity-icon severity-unknown"
        >
          <circle cx="8" cy="8" r="7" stroke="currentColor" fill="none" />
          <path d="M5 6a3 3 0 1 1 6 0c0 2-3 1.5-3 4" stroke="currentColor" strokeWidth="1.5" />
          <circle cx="8" cy="13" r="1" fill="currentColor" />
        </svg>
      );
  }
};
