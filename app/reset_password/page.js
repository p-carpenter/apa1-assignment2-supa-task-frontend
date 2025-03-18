"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/app/contexts/AuthContext";
import Link from "next/link";
import authStyles from "@/app/components/forms/Auth.module.css";
import layoutStyles from "@/app/components/layouts/Layout.module.css";
import terminalStyles from "@/app/components/ui/console/Terminal.module.css";
import { ResetPasswordForm } from "@/app/components/forms";
import { useForm } from "@/app/hooks/forms/useForm";

import { ConsoleWindow, ConsoleSection, CommandOutput } from "../components/ui";

export default function ResetPasswordPage() {
  const { isAuthenticated, loading } = useAuth();
  const router = useRouter();
  const [errorMessage, setErrorMessage] = useState("");
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
      // Validate a single field
      if (fieldName === "email") {
        const error = validateEmail(data.email);
        if (error) errors.email = error;
      }
      return errors;
    }

    // Validate all fields
    const emailError = validateEmail(data.email);
    if (emailError) errors.email = emailError;

    return errors;
  };

  const handleFormSubmit = async (formData) => {
    setErrorMessage("");
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
        throw new Error(data.error || "Something went wrong");
      }

      setSuccessMessage(
        "Password reset instructions have been sent to your email."
      );

      resetForm();
    } catch (err) {
      setErrorMessage(err.message || "Failed to process request");
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

              {errorMessage && (
                <div className={authStyles.authError}>{errorMessage}</div>
              )}
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
