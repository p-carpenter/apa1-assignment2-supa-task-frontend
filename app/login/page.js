"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
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
  const searchParams = useSearchParams();
  const [signupSuccessMessage, setSignupSuccessMessage] = useState("");

  useEffect(() => {
    // Check for signupSuccess parameter
    const signupSuccess = searchParams.get("signupSuccess");
    if (signupSuccess === "true") {
      setSignupSuccessMessage(
        "Account created successfully! Please check your email for verification instructions."
      );
    }
  }, [searchParams]);

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

              {/* Display signup success message if present */}
              {signupSuccessMessage && (
                <div
                  className={`${terminalStyles.outputText} ${terminalStyles.success}`}
                  style={{
                    color: "#4CAF50",
                    marginTop: "10px",
                    padding: "8px",
                    borderLeft: "3px solid #4CAF50",
                    backgroundColor: "rgba(76, 175, 80, 0.1)",
                  }}
                >
                  {signupSuccessMessage}
                </div>
              )}
            </CommandOutput>

            <LoginForm />
          </ConsoleSection>
        </ConsoleWindow>
      </div>
    </>
  );
}
