"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/app/contexts/AuthContext";
import { LoginForm } from "@/app/components/forms";
import authStyles from "@/app/components/forms/Auth.module.css";
import layoutStyles from "@/app/components/layouts/Layout.module.css";
import terminalStyles from "@/app/components/ui/console/Terminal.module.css";

import { ConsoleWindow, ConsoleSection, CommandOutput } from "../components/ui";
import { Button } from "../components/ui/buttons";

export default function LoginPage() {
  const { isAuthenticated, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && isAuthenticated) {
      router.push("/profile");
    }
  }, [isAuthenticated, loading, router]);

  // Define status items for the console footer
  const statusItems = [
    "TECH INCIDENTS ARCHIVE",
    "USER AUTHENTICATION",
    { text: "AWAITING CREDENTIALS", blink: true },
  ];

  return (
    <>
      <div className={authStyles.pageContainer}>
        <ConsoleWindow
          title="tech-incidents-login"
          statusItems={statusItems}
          className={authStyles.console}
        >
          <ConsoleSection
            command="security --auth"
            commandParts={{
              baseCommand: "security",
              flags: ["--auth"],
            }}
          >
            <CommandOutput
              title="USER LOGIN"
              showGlitch={true}
              showLoadingBar={true}
            >
              <div className={terminalStyles.outputText}>
                Authentication required for secure access.
              </div>
              <div
                className={`${terminalStyles.outputText} ${terminalStyles.highlight}`}
              >
                PLEASE ENTER YOUR CREDENTIALS
              </div>
            </CommandOutput>

            <LoginForm />
          </ConsoleSection>
        </ConsoleWindow>
      </div>
    </>
  );
}
