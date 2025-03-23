"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/app/contexts/AuthContext";
import Link from "next/link";
import authStyles from "@/app/components/forms/Auth.module.css";
import loadingStyles from "@/app/components/ui/shared/Loading.module.css";
import terminalStyles from "@/app/components/ui/console/Terminal.module.css";
import { ConfirmResetForm } from "@/app/components/forms";
import { useForm } from "@/app/hooks/useForm";
import { validateAuthForm } from "@/app/utils/validation/formValidation";
import { processApiError } from "@/app/utils/errors/errorService";
import { ERROR_TYPES } from "@/app/utils/errors/errorTypes";

import {
  ConsoleWindow,
  ConsoleSection,
  CommandOutput,
} from "../../components/ui/console";

export default function ConfirmResetPage() {
  const { isAuthenticated, loading, handleResetPasswordConfirm } = useAuth();
  const router = useRouter();

  const [token, setToken] = useState("");
  const [apiError, setApiError] = useState(null);
  const [successMessage, setSuccessMessage] = useState("");
  const submissionInProgress = useRef(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const hash = window.location.hash;

      if (hash && hash.includes("access_token=")) {
        const extractedToken = hash.replace("#access_token=", "");
        setToken(extractedToken);
      }
    }
  }, []);

  useEffect(() => {
    if (
      typeof window !== "undefined" &&
      !token &&
      !window.location.hash.includes("access_token")
    ) {
      setApiError({
        message: "Password reset token is missing or invalid. Please request a new password reset.",
        type: ERROR_TYPES.TOKEN_EXPIRED
      });
      
      router.push("/reset_password");
    }
  }, [isAuthenticated, loading, router, token]);

  const handleFormSubmit = async (formData) => {
    if (submissionInProgress.current) {
      return;
    }

    submissionInProgress.current = true;
    setApiError(null);
    setSuccessMessage("");

    try {
      if (formData.password !== formData.confirmPassword) {
        const error = {
          type: ERROR_TYPES.BAD_REQUEST,
          message: "Passwords do not match."
        };
        setApiError(error);
        submissionInProgress.current = false;
        return;
      }

      await handleResetPasswordConfirm({
        email: formData.email,
        password: formData.password,
        token,
      });
      submissionInProgress.current = false;
      setSuccessMessage(
        "Your password has been successfully reset. You can now login with your new password."
      );
    } catch (err) {
      // Handle different error types
      let standardError;
      if (err.message === "Token has expired" || err.type === ERROR_TYPES.TOKEN_EXPIRED) {
        standardError = {
          type: ERROR_TYPES.TOKEN_EXPIRED,
          message: "Password reset token has expired. Please request a new one."
        };
      } else if (err.message === "Unexpected error") {
        standardError = {
          type: ERROR_TYPES.UNKNOWN_ERROR,
          message: "An unexpected error occurred. Please try again or request a new reset link."
        };
      } else {
        standardError = processApiError(err, {
          defaultMessage: "Failed to reset password. Please try again."
        });
      }
      
      setApiError(standardError);
      submissionInProgress.current = false;
    } finally {
      submissionInProgress.current = false;
    }
  };

  const initialFormState = {
    email: "",
    password: "",
    confirmPassword: "",
  };

  const { formData, formErrors, isSubmitting, handleChange, handleSubmit } =
    useForm(
      initialFormState,
      (data, fieldName) =>
        validateAuthForm(data, fieldName, {
          options: {
            requirePasswordConfirmation: true,
            minLength: 8,
            requireUppercase: true,
            requireNumbers: true,
            requireSpecial: true,
          },
        }),
      handleFormSubmit
    );

  const statusItems = [
    "TECH INCIDENTS ARCHIVE",
    "PASSWORD RECOVERY",
    { text: "RESET PASSWORD", blink: true },
  ];

  if (
    typeof window !== "undefined" &&
    !token &&
    window.location.hash.includes("access_token")
  ) {
    return (
      <div className={loadingStyles.loadingContainer}>
        <div className={authStyles.authLoading}></div>
        <p>Loading password reset form...</p>
      </div>
    );
  }

  if (
    !token &&
    typeof window !== "undefined" &&
    !window.location.hash.includes("access_token")
  ) {
    // Return null as before, but we've already set an error and redirect in the useEffect
    return null;
  }

  return (
    <>
      <div className={authStyles.pageContainer}>
        <ConsoleWindow
          title="tech-incidents-password-reset"
          statusItems={statusItems}
          className={authStyles.console}
        >
          <ConsoleSection
            command="security --recovery --reset"
            commandParts={{
              baseCommand: "security",
              flags: ["--recovery", "--reset"],
            }}
          >
            <CommandOutput
              title="PASSWORD RESET"
              showGlitch={true}
              showLoadingBar={true}
            >
              <div className={terminalStyles.outputText}>
                Create a new password for your account.
              </div>
              <div
                className={`${terminalStyles.outputText} ${terminalStyles.highlight}`}
              >
                ENTER NEW PASSWORD
              </div>
            </CommandOutput>

            <div className={authStyles.formContainer}>
              <div className={authStyles.header}>
                <h2 className={authStyles.title}>RESET PASSWORD</h2>
                <p className={authStyles.subtitle}>
                  Create a new secure password
                </p>
              </div>

              {successMessage && (
                <>
                <div className={authStyles.authSuccess}>{successMessage}</div>
                <div className={authStyles.authFooter}>
                <p>
                  <Link href="/login" className={authStyles.authLink}>
                    Back
                  </Link>
                </p>
              </div>
              </>
              )}

              {!successMessage && (
                   <>             
                <ConfirmResetForm
                  formData={formData}
                  formErrors={formErrors}
                  handleChange={handleChange}
                  handleSubmit={handleSubmit}
                  isSubmitting={isSubmitting || loading}
                  apiError={apiError}
                />
                              <div className={authStyles.authFooter}>
                <p>
                  Remember your password?{" "}
                  <Link href="/login" className={authStyles.authLink}>
                    Back
                  </Link>
                </p>
              </div>
              </>
              )}
            </div>
          </ConsoleSection>
        </ConsoleWindow>
      </div>
    </>
  );
}
