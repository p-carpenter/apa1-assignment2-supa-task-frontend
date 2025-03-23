"use client";

import React from "react";
import Link from "next/link";
import { useAuth } from "../../../contexts/AuthContext";
import styles from "./Terminal.module.css";
import authStyles from "@/app/components/forms/Auth.module.css";

const TerminalHeader = ({
  title = "tech-incidents-catalog",
  showAuthControls = true,
}) => {
  const { isAuthenticated, user, signOut } = useAuth();

  // Get username from user object, fallback to email if not available
  const username = user?.displayName || user?.email?.split("@")[0] || "Guest";

  const handleLogout = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  return (
    <div className={styles.terminalHeader}>
      <span className={styles.terminalDot}></span>
      <span className={styles.terminalDot}></span>
      <span className={styles.terminalDot}></span>
      <div className={styles.terminalTitle}>{title}</div>

      {showAuthControls && (
        <div className={authStyles.authControls}>
          {isAuthenticated ? (
            // Show Profile and Logout buttons when authenticated
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
          ) : (
            // Show Login and Sign Up buttons when not authenticated
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
          )}
        </div>
      )}
    </div>
  );
};

export default TerminalHeader;
