"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/app/contexts/AuthContext";
import ProfileInfo from "./ProfileInfo";
import loadingStyles from "@/app/components/ui/shared/Loading.module.css";
import terminalStyles from "@/app/components/ui/console/Terminal.module.css";

import { ConsoleWindow, ConsoleSection, CommandOutput } from "../components/ui";
import { Button } from "../components/ui/buttons";

const ProfilePage = () => {
  const { loading, user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login"); // Redirect to login if not authenticated
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
