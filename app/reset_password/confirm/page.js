"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/app/contexts/AuthContext";
import Link from "next/link";
import authStyles from "@/app/components/forms/Auth.module.css";
import loadingStyles from "@/app/components/ui/shared/Loading.module.css";
import terminalStyles from "@/app/components/ui/console/Terminal.module.css";
import { ConfirmResetForm } from "@/app/components/forms";
import { useForm } from "@/app/hooks/forms/useForm";
import { ERROR_TYPES } from "@/app/utils/api/errors/errorHandling";
import { validateAuthForm } from "@/app/utils/formValidation";

import {
  ConsoleWindow,
  ConsoleSection,
  CommandOutput,
} from "../../components/ui/console";

export default function ConfirmResetPage() {
  const { isAuthenticated, loading } = useAuth();
  const router = useRouter();

  const [token, setToken] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [apiError, setApiError] = useState(null);
  const [successMessage, setSuccessMessage] = useState("");

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
    if (!loading && isAuthenticated) {
      router.push("/profile");
    }

    if (
      typeof window !== "undefined" &&
      !token &&
      !window.location.hash.includes("access_token")
    ) {
      router.push("/reset_password");
    }
  }, [isAuthenticated, loading, router, token]);

  const handleFormSubmit = async (formData) => {
    setErrorMessage("");
    setApiError(null);
    setSuccessMessage("");

    try {
      const response = await fetch("/api/auth/password-recovery/confirm", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
          token,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        const error = new Error(data.error || "Something went wrong");
        error.status = response.status;

        switch (response.status) {
          case 400:
            error.type = ERROR_TYPES.VALIDATION_ERROR;
            break;
          case 401:
            error.type = ERROR_TYPES.INVALID_CREDENTIALS;
            error.message =
              "Invalid or expired token. Please request a new password reset link.";
            break;
          case 404:
            error.type = ERROR_TYPES.NOT_FOUND;
            error.message = "No account found with that email address.";
            break;
          default:
            error.type = ERROR_TYPES.UNKNOWN_ERROR;
        }

        throw error;
      }

      setSuccessMessage(
        "Your password has been successfully reset. You can now login with your new password."
      );
    } catch (err) {
      if (err.type) {
        setApiError(err);
      } else {
        setApiError({
          type: ERROR_TYPES.UNKNOWN_ERROR,
          message: err.message || "Failed to process request",
        });
      }

      throw err;
    }
  };

  const initialFormState = {
    email: "",
    password: "",
    confirmPassword: "",
  };
  const validateFormFunction = (data, fieldName) =>
    validateAuthForm(data, fieldName, {
      options: { requirePasswordConfirmation: true },
    });

  const { formData, formErrors, isSubmitting, handleChange, handleSubmit } =
    useForm(initialFormState, validateFormFunction, handleFormSubmit);

  const statusItems = [
    "TECH INCIDENTS ARCHIVE",
    "PASSWORD RECOVERY",
    { text: "RESET PASSWORD", blink: true },
  ];

  const handleRetry = () => {
    setApiError(null);
    handleSubmit(new Event("submit"));
  };

  const handleDismiss = () => {
    setApiError(null);
  };

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
                <div className={authStyles.authSuccess}>{successMessage}</div>
              )}

              {!successMessage && (
                <ConfirmResetForm
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
