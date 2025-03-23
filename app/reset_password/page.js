"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/app/contexts/AuthContext";
import Link from "next/link";
import authStyles from "@/app/components/forms/Auth.module.css";
import terminalStyles from "@/app/components/ui/console/Terminal.module.css";
import { ResetPasswordForm } from "@/app/components/forms";
import { useForm } from "@/app/hooks/useForm";
import { validateResetPasswordForm } from "@/app/utils/validation/formValidation";
import { processApiError } from "@/app/utils/errors/errorService";
import { ERROR_TYPES } from "@/app/utils/errors/errorTypes";

import {
  ConsoleWindow,
  ConsoleSection,
  CommandOutput,
} from "../components/ui/console";

export default function ResetPasswordPage() {
  const { isAuthenticated, loading, handleResetPassword } = useAuth();
  const router = useRouter();
  const [apiError, setApiError] = useState(null);
  const [successMessage, setSuccessMessage] = useState("");
  const submissionInProgress = useRef(false);
  useEffect(() => {
    if (!loading && isAuthenticated) {
      router.push("/profile");
    }
  }, [isAuthenticated, loading, router]);

  const handleFormSubmit = async (formData) => {
    if (submissionInProgress.current) {
      return;
    }

    submissionInProgress.current = true;
    setApiError(null);
    setSuccessMessage("");

    try {
      await handleResetPassword(formData.email);

      setSuccessMessage(
        "Password reset instructions have been sent to your email."
      );

      submissionInProgress.current = false;
      return { success: true };
    } catch (err) {
      console.error("Password reset error:", err);
      
      // Handle the error differently based on the type
      let standardError;
      if (err.message === "Network error") {
        standardError = {
          type: ERROR_TYPES.NETWORK_ERROR,
          message: "Network error. Please check your connection and try again.",
          details: "Network error. Please check your connection and try again."
        };
      } else if (err.message === "Unexpected error") {
        standardError = {
          type: ERROR_TYPES.UNKNOWN_ERROR,
          message: "An unexpected error occurred. Please try again.",
          details: "An unexpected error occurred. Please try again."
        };
      } else if (err.message === "Failed to send reset email") {
        standardError = {
          type: ERROR_TYPES.BAD_REQUEST,
          message: "Failed to send reset email. Please try again later.",
          details: "Failed to send reset email. Please try again later."
        };
      } else {
        standardError = processApiError(err, {
          defaultMessage: "Failed to send password reset instructions. Please try again."
        });
      }

      setApiError(standardError);
      submissionInProgress.current = false;
      throw standardError;
    } finally {
      submissionInProgress.current = false;
    }
  };

  const initialFormState = { email: "" };

  const {
    formData,
    formErrors,
    isSubmitting,
    handleChange,
    handleSubmit,
    resetForm,
  } = useForm(initialFormState, validateResetPasswordForm, handleFormSubmit);

  const statusItems = [
    "TECH INCIDENTS ARCHIVE",
    "PASSWORD RECOVERY",
    { text: "REQUEST RESET", blink: true },
  ];

  return (
    <>
      <div className={authStyles.pageContainer}>
        <ConsoleWindow
          title="tech-incidents-password-recovery"
          statusItems={statusItems}
          className={authStyles.console}
        >
          <ConsoleSection
            command="security --recovery --request"
            commandParts={{
              baseCommand: "security",
              flags: ["--recovery", "--request"],
            }}
          >
            <CommandOutput
              title="PASSWORD RECOVERY"
              showGlitch={true}
              showLoadingBar={true}
            >
              <div className={terminalStyles.outputText}>
                Request a password reset link to be sent to your email.
              </div>
              <div
                className={`${terminalStyles.outputText} ${terminalStyles.highlight}`}
              >
                ENTER YOUR EMAIL ADDRESS
              </div>
            </CommandOutput>

            <div className={authStyles.formContainer}>
              <div className={authStyles.header}>
                <h2 className={authStyles.title}>RECOVER ACCESS</h2>
                <p className={authStyles.subtitle}>
                  We&apos;ll send you password reset instructions to your email.
                </p>
              </div>

              {successMessage ? (
                <div className={authStyles.authSuccess}>{successMessage}</div>
              ) : (
                <ResetPasswordForm
                  formData={formData}
                  formErrors={formErrors}
                  handleChange={handleChange}
                  handleSubmit={handleSubmit}
                  isSubmitting={isSubmitting || loading}
                  apiError={apiError}
                />
              )}

              <div className={authStyles.authFooter}>
                <p>
                  Remember your password?{" "}
                  <Link href="/login" className={authStyles.authLink}>
                    Back to login
                  </Link>
                </p>
              </div>
            </div>
          </ConsoleSection>
        </ConsoleWindow>
      </div>
    </>
  );
}
