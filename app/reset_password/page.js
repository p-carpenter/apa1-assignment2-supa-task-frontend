"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/app/contexts/AuthContext";
import Link from "next/link";
import authStyles from "@/app/components/forms/Auth.module.css";
import terminalStyles from "@/app/components/ui/console/Terminal.module.css";
import { ResetPasswordForm } from "@/app/components/forms";
import { useForm } from "@/app/hooks/forms/useForm";
import { ERROR_TYPES } from "@/app/utils/api/errors/errorHandling";

import {
  ConsoleWindow,
  ConsoleSection,
  CommandOutput,
} from "../components/ui/console";

export default function ResetPasswordPage() {
  const { isAuthenticated, loading } = useAuth();
  const router = useRouter();
  const [errorMessage, setErrorMessage] = useState("");
  const [apiError, setApiError] = useState(null);
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    if (!loading && isAuthenticated) {
      router.push("/profile");
    }
  }, [isAuthenticated, loading, router]);

  const validateEmail = (email) => {
    if (!email.trim()) {
      return "Email is required.";
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return "Please enter a valid email address.";
    }

    return null;
  };

  const validateForm = (data, fieldName) => {
    const errors = {};

    if (fieldName) {
      if (fieldName === "email") {
        const error = validateEmail(data.email);
        if (error) errors.email = error;
      }
      return errors;
    }

    const emailError = validateEmail(data.email);
    if (emailError) errors.email = emailError;

    return errors;
  };

  const handleRetry = () => {
    setApiError(null);
    handleSubmit(new Event("submit"));
  };

  const handleDismiss = () => {
    setApiError(null);
  };

  const handleFormSubmit = async (formData) => {
    setErrorMessage("");
    setApiError(null);
    setSuccessMessage("");

    try {
      const response = await fetch("/api/auth/password-recovery", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email: formData.email }),
      });

      const data = await response.json();

      if (!response.ok) {
        const error = new Error(data.error || "Something went wrong");
        error.status = response.status;

        switch (response.status) {
          case 400:
            error.type = ERROR_TYPES.VALIDATION_ERROR;
            break;
          case 404:
            error.type = ERROR_TYPES.NOT_FOUND;
            error.message = "No account found with that email address.";
            break;
          case 429:
            error.type = ERROR_TYPES.RATE_LIMITED;
            error.message = "Too many requests. Please try again later.";
            break;
          default:
            error.type = ERROR_TYPES.UNKNOWN_ERROR;
        }

        throw error;
      }

      setSuccessMessage(
        "Password reset instructions have been sent to your email."
      );

      resetForm();
    } catch (err) {
      if (err.type) {
        setApiError(err);
      } else {
        setApiError({
          type: ERROR_TYPES.UNKNOWN_ERROR,
          message: err.message || "Failed to process request",
        });
      }

      throw err; // Re-throw for useForm to handle
    }
  };

  const {
    formData,
    formErrors,
    isSubmitting,
    handleChange,
    handleSubmit,
    resetForm,
    hasError,
  } = useForm({ email: "" }, validateForm, handleFormSubmit);

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

              {successMessage && (
                <div className={authStyles.authSuccess}>{successMessage}</div>
              )}

              {!successMessage && (
                <ResetPasswordForm
                  formData={formData}
                  formErrors={formErrors}
                  handleChange={handleChange}
                  handleSubmit={handleSubmit}
                  isSubmitting={isSubmitting}
                  hasError={hasError}
                  errorMessage={errorMessage}
                  apiError={apiError}
                  onRetry={handleRetry}
                  onDismiss={handleDismiss}
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
