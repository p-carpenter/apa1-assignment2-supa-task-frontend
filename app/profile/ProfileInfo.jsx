"use client";

import { useState } from "react";
import { useAuth } from "@/app/contexts/AuthContext";
import { Button } from "../components/ui/buttons";
import styles from "./ProfileInfo.module.css";
import authStyles from "../components/forms/Auth.module.css";
import layoutStyles from "@/app/components/layouts/Layout.module.css";

export default function ProfileInfo() {
  const { user, signOut, handleResetPassword } = useAuth();
  const [resetStatus, setResetStatus] = useState(null);

  const username = user?.displayName || user?.email?.split("@")[0] || "Guest";

  const handleLogout = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const handlePasswordReset = async () => {
    try {
      setResetStatus({ loading: true });
      await handleResetPassword(user.email);
      setResetStatus({
        success: true,
        message: "Password reset instructions sent to your email",
      });
    } catch (error) {
      console.error("Password reset error:", error);
      setResetStatus({
        error: true,
        message: error.message || "Failed to send reset instructions",
      });
    }
  };

  if (!user) {
    return null;
  }

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

      {resetStatus && (
        <div
          className={`${styles.resetStatus} ${resetStatus.error ? authStyles.success : authStyles.error}`}
        >
          <p>{resetStatus.message}</p>
        </div>
      )}

      <div className={styles.buttonContainer}>
        <Button
          className={`${layoutStyles.homeButton} ${authStyles.authButton}`}
          label="VIEW CATALOG"
          href="/catalog"
        />

        <button
          onClick={handlePasswordReset}
          className={`${authStyles.authButton}`}
          disabled={resetStatus?.loading}
        >
          {resetStatus?.loading ? "SENDING..." : "RESET PASSWORD"}
        </button>

        <button
          onClick={handleLogout}
          className={`${styles.logoutButton} ${authStyles.authButton}`}
        >
          SIGN OUT
        </button>
      </div>
    </div>
  );
}
