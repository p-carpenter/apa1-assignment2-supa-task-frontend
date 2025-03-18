"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/app/contexts/AuthContext";
import { LoginForm } from "@/app/components/forms";
import authStyles from "@/app/components/forms/Auth.module.css";
import terminalStyles from "@/app/components/ui/console/Terminal.module.css";
import { ERROR_TYPES } from "@/app/utils/api/errors/errorHandling";

import {
  ConsoleWindow,
  ConsoleSection,
  CommandOutput,
} from "../components/ui/console";

export default function LoginPage() {
  const { isAuthenticated, loading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [signupSuccessMessage, setSignupSuccessMessage] = useState("");
  const [apiError, setApiError] = useState(null);

  useEffect(() => {
    // Check for signupSuccess parameter
    const signupSuccess = searchParams.get("signupSuccess");
    if (signupSuccess === "true") {
      setSignupSuccessMessage(
        "Account created successfully! Please check your email for verification instructions."
      );
    }

    // Check for error parameters
    const errorType = searchParams.get("error");
    if (errorType) {
      let errorMessage = "An error occurred during authentication.";
      let errorTypeValue = ERROR_TYPES.UNKNOWN_ERROR;

      switch (errorType) {
        case "session_expired":
          errorMessage = "Your session has expired. Please log in again.";
          errorTypeValue = ERROR_TYPES.SESSION_EXPIRED;
          break;
        case "not_authenticated":
          errorMessage = "You need to be logged in to access that page.";
          errorTypeValue = ERROR_TYPES.AUTH_REQUIRED;
          break;
      }

      setApiError({
        type: errorTypeValue,
        message: errorMessage,
      });
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

  const handleLoginError = (error) => {
    if (error.type) {
      // Already a standardized error
      setApiError(error);
    } else {
      // Create a standardized error
      setApiError({
        type: ERROR_TYPES.UNKNOWN_ERROR,
        message: error.message || "Authentication failed",
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

            <LoginForm
              apiError={apiError}
              onError={handleLoginError}
              onRetry={handleRetry}
              onDismiss={handleDismiss}
            />
          </ConsoleSection>
        </ConsoleWindow>
      </div>
    </>
  );
}
