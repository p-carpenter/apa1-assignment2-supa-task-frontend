"use client";

import { useAuth } from "@/app/contexts/AuthContext";
import { useState, useEffect } from "react";
import { Button } from "../components/ui/buttons";
import { getProtectedData, addProtectedData } from "@/app/utils/auth/authUtils";

export default function ProfileInfo() {
  const { user, logout } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Get username from user object, fallback to email if not available
  const username = user?.displayName || user?.email?.split("@")[0] || "Guest";

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  if (!user) {
    return null;
  }

  return (
    <div className="auth-form-container profile-container">
      <div className="auth-header">
        <h2 className="auth-title">USER PROFILE</h2>
        <p className="auth-subtitle">Access level: Registered Member</p>
      </div>

      <div className="profile-info">
        <div className="profile-row">
          <div className="profile-label">Username:</div>
          <div className="profile-value">{username}</div>
        </div>
        <div className="profile-row">
          <div className="profile-label">Email:</div>
          <div className="profile-value">{user.email}</div>
        </div>
        <div className="profile-row">
          <div className="profile-label">User ID:</div>
          <div className="profile-id">{user.id}</div>
        </div>
      </div>

      <div className="button-container">
        <Button className="auth-button" label="VIEW CATALOG" href="/catalog" />

        <button onClick={handleLogout} className="auth-button logout-button">
          SIGN OUT
        </button>
      </div>
    </div>
  );
}
