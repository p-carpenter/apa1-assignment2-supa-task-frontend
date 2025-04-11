"use client";

import { useState, useRef, useEffect } from "react";
import { useAuth } from "@/app/contexts/AuthContext";
import { Button } from "@/app/components/ui/buttons";
import { ApiMessage } from "@/app/components/forms/ApiMessage";
import styles from "./ProfileInfo.module.css";
import authStyles from "@/app/components/forms/Auth.module.css";
import layoutStyles from "@/app/components/layouts/Layout.module.css";

/**
 * Component displaying user profile information and account management options
 * Shows user details and provides buttons for password reset and logout
 */
const ProfileInfo = () => {
  const { user, signOut, handleResetPassword } = useAuth();
  const [apiMessage, setApiMessage] = useState(null);
  const [isResetting, setIsResetting] = useState(false);
  const messageTimeoutRef = useRef(null);

  useEffect(() => {
    return () => {
      if (messageTimeoutRef.current) {
        clearTimeout(messageTimeoutRef.current);
      }
    };
  }, []);

  /**
   * Handles user logout
   */
  const handleLogout = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  /**
   * Initiates password reset process for the authenticated user
   */
  const handlePasswordReset = async () => {
    try {
      if (messageTimeoutRef.current) {
        clearTimeout(messageTimeoutRef.current);
        messageTimeoutRef.current = null;
      }

      setIsResetting(true);
      setApiMessage(null);

      await handleResetPassword(user.email);

      setApiMessage({
        type: "success",
        message: "Password reset instructions sent to your email",
      });

      messageTimeoutRef.current = setTimeout(() => {
        setApiMessage(null);
      }, 3000);
    } catch (error) {
      console.error("Password reset error:", error);
      setApiMessage({
        type: "error",
        message: error.message || "Failed to send reset instructions",
      });

      messageTimeoutRef.current = setTimeout(() => {
        setApiMessage(null);
      }, 3000);
    } finally {
      setIsResetting(false);
    }
  };

  if (!user) {
    return null;
  }

  const username = user?.displayName || user?.email?.split("@")[0] || "Guest";

  return (
    <div className={`${styles.profileContainer}`}>
      <div className={authStyles.header}>
        <h2 className={authStyles.title}>USER PROFILE</h2>
        <p className={authStyles.subtitle}>Access level: Registered Member</p>
      </div>

      <div className={styles.profileInfo}>
        <div className={styles.profileRow}>
          <div className={styles.profileLabel}>Username:</div>
          <div className={styles.profileValue}>{username}</div>
        </div>
        <div className={styles.profileRow}>
          <div className={styles.profileLabel}>Email:</div>
          <div className={styles.profileValue}>{user.email}</div>
        </div>
        <div className={styles.profileRow}>
          <div className={styles.profileLabel}>User ID:</div>
          <div className={styles.profileId}>{user.id}</div>
        </div>
      </div>

      {apiMessage && <ApiMessage response={apiMessage} />}

      <div className={styles.buttonContainer}>
        <Button
          className={`${layoutStyles.homeButton} ${authStyles.authButton}`}
          label="VIEW CATALOG"
          href="/catalog"
        />

        <Button
          onClick={handlePasswordReset}
          className={`${layoutStyles.homeButton} ${authStyles.authButton}`}
          disabled={isResetting}
          label={isResetting ? "SENDING..." : "RESET PASSWORD"}
          icon=""
        />

        <button
          onClick={handleLogout}
          className={`${styles.logoutButton} ${authStyles.authButton}`}
        >
          SIGN OUT
        </button>
      </div>
    </div>
  );
};

export default ProfileInfo;
