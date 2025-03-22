"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/app/contexts/AuthContext";
import Link from "next/link";
import authStyles from "@/app/components/forms/Auth.module.css";
import terminalStyles from "@/app/components/ui/console/Terminal.module.css";
import { ResetPasswordForm } from "@/app/components/forms";
import { useForm } from "@/app/hooks/useForm";
import { validateAuthForm } from "@/app/utils/validation/formValidation";
import { processApiError } from "@/app/utils/errors/errorService";

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

  useEffect(() => {
    if (!loading && isAuthenticated) {
      router.push("/profile");
    }
  }, [isAuthenticated, loading, router]);

  // Declare this outside of useEffect to avoid dependency issues
  const handleFormSubmit = async (formData) => {
    // The key issue: don't check submissionInProgress here because useForm already prevents duplicate submissions
    // This creates a race condition with the useForm's own isSubmitting state

    console.log("handleFormSubmit called with:", formData);
    setApiError(null);
    setSuccessMessage("");

    try {
      console.log("Calling handleResetPassword with email:", formData.email);
      await handleResetPassword(formData.email);
      console.log("Password reset instructions sent successfully");

      setSuccessMessage(
        "Password reset instructions have been sent to your email."
      );

      // Don't call resetForm here, it's not stable
      // resetForm();

      // Return success to signal to useForm that submission was successful
      return { success: true };
    } catch (err) {
      console.error("Password reset error:", err);
      const standardError = processApiError(err, {
        defaultMessage: "Failed to process request",
      });
      setApiError(standardError);

      // Important: throw the error to let useForm know submission failed
      throw standardError;
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
  } = useForm(initialFormState, validateAuthForm, handleFormSubmit);

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
