"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/app/contexts/AuthContext";
import ProfileInfo from "./ProfileInfo";
import styles from "./Profile.module.css";
import authStyles from "../components/forms/Auth.module.css";
import layoutStyles from "@/app/components/layouts/Layout.module.css";
import loadingStyles from "@/app/components/ui/shared/Loading.module.css";
import terminalStyles from "@/app/components/ui/console/Terminal.module.css";

import { ConsoleWindow, ConsoleSection, CommandOutput } from "../components/ui";
import { Button } from "../components/ui/buttons";

const ProfilePage = () => {
  const { isAuthenticated, loading, user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push("/login");
    }
  }, [isAuthenticated, loading, router]);

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
