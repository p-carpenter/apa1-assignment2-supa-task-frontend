"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/app/contexts/AuthContext";
import { useForm } from "@/app/hooks/forms/useForm";
import { SignupForm } from "@/app/components/forms";
import authStyles from "@/app/components/forms/Auth.module.css";
import terminalStyles from "@/app/components/ui/console/Terminal.module.css";
import { ERROR_TYPES } from "@/app/utils/api/errors/errorHandling";
import { validateAuthForm } from "@/app/utils/formValidation";

import {
  ConsoleWindow,
  ConsoleSection,
  CommandOutput,
} from "../components/ui/console";

export default function SignupPage() {
  const { isAuthenticated, loading: authLoading, signUp } = useAuth();
  const router = useRouter();
  const [apiError, setApiError] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [passwordRequirements, setPasswordRequirements] = useState([]);

  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      router.push("/profile");
    }
  }, [isAuthenticated, authLoading, router]);

  const updatePasswordRequirements = (password) => {
    if (!password) {
      setPasswordRequirements([]);
      return;
    }

    const requirements = [];
    const hasMinLength = password.length >= 8;
    const hasNumber = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(
      password
    );
    const hasUpperCase = /[A-Z]/.test(password);

    if (!hasMinLength) {
      requirements.push({
        key: "passwordMinLength",
        value: "Password must be at least 8 characters long.",
      });
    }

    if (!hasNumber) {
      requirements.push({
        key: "passwordNumber",
        value: "Password must contain at least one number.",
      });
    }

    if (!hasSpecialChar) {
      requirements.push({
        key: "passwordSpecialChar",
        value: "Password must contain at least one special character.",
      });
    }

    if (!hasUpperCase) {
      requirements.push({
        key: "passwordUpperCase",
        value: "Password must contain at least one uppercase letter.",
      });
    }

    setPasswordRequirements(requirements);
  };

  const handleFormSubmit = async (formData) => {
    setErrorMessage("");
    setApiError(null);

    try {
      await signUp({
        email: formData.email,
        password: formData.password,
        displayName: formData.email.split("@")[0],
      });

      window.location.href = "/login?signupSuccess=true";
    } catch (err) {
      if (err.type) {
        setApiError(err);
      } else {
        setApiError({
          type: ERROR_TYPES.UNKNOWN_ERROR,
          message: err.message || "Failed to create account",
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

  const formValidationFunction = (data, fieldName) => {
    const options = { requirePasswordConfirmation: true };
    return validateAuthForm(data, fieldName, { options });
  };

  const { formData, formErrors, isSubmitting, handleChange, handleSubmit } =
    useForm(initialFormState, formValidationFunction, handleFormSubmit);

  const customHandleChange = (e) => {
    handleChange(e);

    if (e.target.name === "password") {
      updatePasswordRequirements(e.target.value);
    }
  };

  const statusItems = [
    "TECH INCIDENTS ARCHIVE",
    "USER REGISTRATION",
    { text: "NEW ACCOUNT CREATION", blink: true },
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
              formData={formData}
              formErrors={formErrors}
              handleChange={customHandleChange}
              handleSubmit={handleSubmit}
              isSubmitting={isSubmitting}
              errorMessage={errorMessage}
              apiError={apiError}
              onRetry={handleRetry}
              onDismiss={handleDismiss}
              passwordRequirements={passwordRequirements}
            />
          </ConsoleSection>
        </ConsoleWindow>
      </div>
    </>
  );
}
