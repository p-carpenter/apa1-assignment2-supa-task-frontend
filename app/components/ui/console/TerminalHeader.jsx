"use client";

import React from "react";
import Link from "next/link";
import { useAuth } from "../../../contexts/AuthContext";
import styles from "./Terminal.module.css";
import authStyles from "@/app/components/forms/Auth.module.css";

/**
 * Renders the header of the terminal with title and authentication controls
 *
 * @param {Object} props - Component props
 * @param {string} [props.title="tech-incidents-catalog"] - Title to display in the header
 * @param {boolean} [props.showAuthControls=true] - Whether to show authentication controls
 */
const TerminalHeader = ({
  title = "tech-incidents-catalog",
  showAuthControls = true,
}) => {
  const { isAuthenticated, user, signOut } = useAuth();
  const username = extractUsername(user);

  /**
   * Handles the user logout process
   * Attempts to sign out the current user and logs any errors that occur
   *
   * @async
   * @function handleLogout
   * @returns {Promise<void>} Promise that resolves when logout is complete
   * @throws {Error} Logs error to console but doesn't propagate it upwards
   */
  const handleLogout = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  return (
    <div className={styles.terminalHeader}>
      {renderDecorations()}
      <div className={styles.terminalTitle}>{title}</div>

      {showAuthControls &&
        renderAuthControls(isAuthenticated, username, handleLogout)}
    </div>
  );
};

/**
 * Extracts username from user object
 *
 * @param {Object|null} user - User object from auth context
 * @returns {string} Username or "Guest" if not available
 */
const extractUsername = (user) => {
  if (!user) return "Guest";
  return user.displayName || user.email?.split("@")[0] || "Guest";
};

/**
 * Renders terminal decoration dots
 *
 * @returns {JSX.Element} Terminal decoration elements
 */
const renderDecorations = () => {
  return (
    <>
      <span className={styles.terminalDot}></span>
      <span className={styles.terminalDot}></span>
      <span className={styles.terminalDot}></span>
    </>
  );
};

/**
 * Renders authentication controls based on authentication state
 *
 * @param {boolean} isAuthenticated - Whether user is authenticated
 * @param {string} username - Username to display
 * @param {Function} handleLogout - Logout handler function
 * @returns {JSX.Element} Authentication controls
 */
const renderAuthControls = (isAuthenticated, username, handleLogout) => {
  return (
    <div className={authStyles.authControls}>
      {isAuthenticated
        ? renderAuthenticatedControls(username, handleLogout)
        : renderUnauthenticatedControls()}
    </div>
  );
};

/**
 * Renders controls for authenticated users
 *
 * @param {string} username - Username to display
 * @param {Function} handleLogout - Logout handler function
 * @returns {JSX.Element} Controls for authenticated users
 */
const renderAuthenticatedControls = (username, handleLogout) => {
  return (
    <>
      <Link
        href="/profile"
        className={`${authStyles.authButton} ${authStyles.login}`}
      >
        Profile: {username}
      </Link>
      <button
        onClick={handleLogout}
        className={`${authStyles.authButton} ${authStyles.signup}`}
      >
        Log Out
      </button>
    </>
  );
};

/**
 * Renders controls for unauthenticated users
 *
 * @returns {JSX.Element} Controls for unauthenticated users
 */
const renderUnauthenticatedControls = () => {
  return (
    <>
      <Link
        href="/login"
        className={`${authStyles.authButton} ${authStyles.login}`}
      >
        Log In
      </Link>
      <Link
        href="/signup"
        className={`${authStyles.authButton} ${authStyles.signup}`}
      >
        Sign Up
      </Link>
    </>
  );
};

export default TerminalHeader;
