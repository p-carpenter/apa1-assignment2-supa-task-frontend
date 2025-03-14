"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/app/contexts/AuthContext";
import ProfileInfo from "./ProfileInfo";
import "./profile.styles.css";


import {
  ConsoleWindow,
  ConsoleSection,
  CommandOutput,
  CatalogHeader,
} from "../components/ui";
import { Button } from "../components/ui/buttons";

export default function ProfilePage() {
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
      <div className="auth-page-container">
        <div className="loading-container">Loading...</div>
      </div>
    );
  }

  return (
    <>
      <div className="circuit-background"></div>

      <div className="auth-page-container">
        <ConsoleWindow
          title="tech-incidents-profile"
          statusItems={statusItems}
          className="auth-console"
        >
          <ConsoleSection
            command="security --profile"
            commandParts={{
              baseCommand: "security",
              flags: ["--profile"],
            }}
          >
            <CommandOutput
              title="USER PROFILE"
              showGlitch={true}
              showLoadingBar={true}
            >
              <div className="output-text">
                Welcome back to the Tech Incidents Archive.
              </div>
            </CommandOutput>

            <ProfileInfo />
          </ConsoleSection>
        </ConsoleWindow>
      </div>
    </>
  );
}
