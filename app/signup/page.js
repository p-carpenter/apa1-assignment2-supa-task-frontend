"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/app/contexts/AuthContext";
import { SignupForm } from "@/app/components/forms";
import authStyles from "@/app/components/forms/Auth.module.css";
import terminalStyles from "@/app/components/ui/console/Terminal.module.css";
import { ERROR_TYPES } from "@/app/utils/api/errors/errorHandling";

import {
  ConsoleWindow,
  ConsoleSection,
  CommandOutput,
} from "../components/ui/console";

export default function SignupPage() {
  const { isAuthenticated, loading } = useAuth();
  const router = useRouter();
  const [apiError, setApiError] = useState(null);

  useEffect(() => {
    if (!loading && isAuthenticated) {
      router.push("/profile");
    }
  }, [isAuthenticated, loading, router]);

  const statusItems = [
    "TECH INCIDENTS ARCHIVE",
    "USER REGISTRATION",
    { text: "NEW ACCOUNT CREATION", blink: true },
  ];

  const handleSignupError = (error) => {
    if (error.type) {
      setApiError(error);
    } else {
      setApiError({
        type: ERROR_TYPES.UNKNOWN_ERROR,
        message: error.message || "Registration failed",
      });
    }
  };

  const handleRetry = () => {
    setApiError(null);
  };

  const handleDismiss = () => {
    setApiError(null);
  };

  return (
    <>
      <div className={authStyles.pageContainer}>
        <ConsoleWindow
          title="tech-incidents-registration"
          statusItems={statusItems}
          className={authStyles.console}
        >
          <ConsoleSection
            command="security --register"
            commandParts={{
              baseCommand: "security",
              flags: ["--register"],
            }}
          >
            <CommandOutput
              title="JOIN THE ARCHIVE"
              showGlitch={true}
              showLoadingBar={true}
            >
              <div className={terminalStyles.outputText}>
                Create a new account to become a member of the Archive and
                contribute.
              </div>
            </CommandOutput>

            <SignupForm
              apiError={apiError}
              onError={handleSignupError}
              onRetry={handleRetry}
              onDismiss={handleDismiss}
            />
          </ConsoleSection>
        </ConsoleWindow>
      </div>
    </>
  );
}
