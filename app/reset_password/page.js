"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/app/contexts/AuthContext";
import Link from "next/link";
import authStyles from "@/app/components/forms/Auth.module.css";
import terminalStyles from "@/app/components/ui/console/Terminal.module.css";
import { ResetPasswordForm } from "@/app/components/forms";
import { useForm } from "@/app/hooks/useForm";
import { ERROR_TYPES } from "@/app/utils/errors/errorTypes";
import { validateAuthForm } from "@/app/utils/validation/formValidation";
import { processApiError } from "@/app/utils/errors/errorService";

import {
  ConsoleWindow,
  ConsoleSection,
  CommandOutput,
} from "../components/ui/console";

export default function ResetPasswordPage() {
  const { isAuthenticated, loading } = useAuth();
  const router = useRouter();
  const [apiError, setApiError] = useState(null);
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    if (!loading && isAuthenticated) {
      router.push("/profile");
    }
  }, [isAuthenticated, loading, router]);

  const handleFormSubmit = async (formData) => {
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
        throw {
          status: response.status,
          data: data,
          message: data.error || "Something went wrong",
        };
      }

      setSuccessMessage(
        "Password reset instructions have been sent to your email."
      );

      resetForm();
    } catch (err) {
      const standardError = processApiError(err, {
        defaultMessage: "Failed to process request",
      });
      setApiError(standardError);
    }
  };

  const initialFormState = { email: "" };
  const validateFormFunction = (data, fieldName) =>
    validateAuthForm(data, fieldName);
  const {
    formData,
    formErrors,
    isSubmitting,
    handleChange,
    handleSubmit,
    resetForm,
  } = useForm(initialFormState, validateFormFunction, handleFormSubmit);

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
