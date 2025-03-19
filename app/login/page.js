"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/app/contexts/AuthContext";
import { useForm } from "@/app/hooks/forms/useForm";
import { LoginForm } from "@/app/components/forms";
import authStyles from "@/app/components/forms/Auth.module.css";
import terminalStyles from "@/app/components/ui/console/Terminal.module.css";
import { ERROR_TYPES } from "@/app/utils/api/errors/errorHandling";
import { validateAuthForm } from "@/app/utils/formValidation";

import {
  ConsoleWindow,
  ConsoleSection,
  CommandOutput,
} from "../components/ui/console";

export default function LoginPage() {
  const { isAuthenticated, loading: authLoading, signIn } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [signupSuccessMessage, setSignupSuccessMessage] = useState("");
  const [apiError, setApiError] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    const signupSuccess = searchParams.get("signupSuccess");
    if (signupSuccess === "true") {
      setSignupSuccessMessage(
        "Account created successfully! Please check your email for verification instructions."
      );
    }

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
    if (!authLoading && isAuthenticated) {
      const from = searchParams.get("from") || "/profile";
      router.push(from);
    }
  }, [isAuthenticated, authLoading, router, searchParams]);

  const handleFormSubmit = async (formData) => {
    setErrorMessage("");
    setApiError(null);

    try {
      await signIn({
        email: formData.email,
        password: formData.password,
      });
      // Redirect is handled by useEffect above
    } catch (err) {
      if (err.type) {
        setApiError(err);
      } else {
        setErrorMessage(err.message || "Failed to sign in");
      }
      throw err;
    }
  };

  const initialFormState = {
    email: "",
    password: "",
  };
  const validateFormFunction = (data, fieldName) =>
    validateAuthForm(data, fieldName);

  const { formData, formErrors, isSubmitting, handleChange, handleSubmit } =
    useForm(initialFormState, validateFormFunction, handleFormSubmit);

  const statusItems = [
    "TECH INCIDENTS ARCHIVE",
    "USER AUTHENTICATION",
    { text: "AWAITING CREDENTIALS", blink: true },
  ];

  const handleRetry = () => {
    setApiError(null);
    handleSubmit(new Event("submit"));
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
              formData={formData}
              formErrors={formErrors}
              handleChange={handleChange}
              handleSubmit={handleSubmit}
              isSubmitting={isSubmitting}
              errorMessage={errorMessage}
              apiError={apiError}
              onRetry={handleRetry}
              onDismiss={handleDismiss}
            />
          </ConsoleSection>
        </ConsoleWindow>
      </div>
    </>
  );
}
