'use client';

import React from 'react';
import Link from 'next/link';
import { useAuth } from '../../../contexts/AuthContext';

const TerminalHeader = ({ title = 'tech-incidents-catalog', showAuthControls = true }) => {
  const { isAuthenticated, user, logout } = useAuth();

  // Get username from user object, fallback to email if not available
  const username = user?.displayName || user?.email?.split('@')[0] || 'Guest';

  // Handle logout button click
  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <div className="terminal-header">
      <span className="terminal-dot"></span>
      <span className="terminal-dot"></span>
      <span className="terminal-dot"></span>
      <div className="terminal-title">{title}</div>
      
      {showAuthControls && (
        <div className="auth-controls">
          {isAuthenticated ? (
            // Show Profile and Logout buttons when authenticated
            <>
              <Link href="/profile" className="auth-button login">Profile: {username}</Link>
              <button onClick={handleLogout} className="auth-button signup">Log Out</button>
            </>
          ) : (
            // Show Login and Sign Up buttons when not authenticated
            <>
              <Link href="/login" className="auth-button login">Log In</Link>
              <Link href="/signup" className="auth-button signup">Sign Up</Link>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default TerminalHeader;
