"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/app/contexts/AuthContext";
import ProfileInfo from "./ProfileInfo";
import authStyles from "@/app/components/forms/Auth.module.css";
import loadingStyles from "@/app/components/ui/shared/Loading.module.css";
import terminalStyles from "@/app/components/ui/console/Terminal.module.css";

import {
  ConsoleWindow,
  ConsoleSection,
  CommandOutput,
} from "../components/ui/console";

/**
 * User profile page component that displays user information
 * Shows user profile details within a console-themed interface
 * Requires authentication - redirects to login if user is not authenticated
 */
const ProfilePage = () => {
  const { loading, user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      const from = encodeURIComponent(window.location.pathname);
      router.push(`/login?from=${from}`);
    }
  }, [user, loading, router]);

  const username = user?.displayName || user?.email?.split("@")[0] || "Guest";

  const statusItems = [
    "TECH INCIDENTS ARCHIVE",
    "USER MANAGEMENT",
    { text: user ? `USER: ${username}` : "LOADING USER DATA", blink: !user },
  ];

  if (loading) {
    return (
      <div>
        <div className={loadingStyles.loadingContainer}>Authenticating...</div>
      </div>
    );
  }
  if (!user) return null;

  return (
    <>
      <div className={authStyles.pageContainer}>
        <ConsoleWindow
          title="tech-incidents-profile"
          statusItems={statusItems}
          className={authStyles.console}
        >
          <ConsoleSection
            command="security --profile"
            commandParts={{
              baseCommand: "security",
              flags: ["--profile"],
            }}
          >
            <CommandOutput title="USER PROFILE" showLoadingBar={true}>
              <div className={terminalStyles.outputText}>
                Welcome back to the Tech Incidents Archive.
              </div>
            </CommandOutput>

            <ProfileInfo data-testid="profile-info" />
          </ConsoleSection>
        </ConsoleWindow>
      </div>
    </>
  );
};

export default ProfilePage;
