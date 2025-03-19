"use client";

import { useState, useRef } from "react";
import { useAuth } from "@/app/contexts/AuthContext";
import { useForm } from "@/app/hooks/useForm";
import { SignupForm } from "@/app/components/forms";
import authStyles from "@/app/components/forms/Auth.module.css";
import terminalStyles from "@/app/components/ui/console/Terminal.module.css";
import { ERROR_TYPES } from "@/app/utils/errors/errorTypes";
import { validateAuthForm } from "@/app/utils/validation/formValidation";
import { processApiError } from "@/app/utils/errors/errorService";

import {
  ConsoleWindow,
  ConsoleSection,
  CommandOutput,
} from "../components/ui/console";

export default function SignupPage() {
  const { isLoading: authLoading, signUp } = useAuth();
  const [apiError, setApiError] = useState(null);
  const [passwordRequirements, setPasswordRequirements] = useState([]);
  const submissionInProgress = useRef(false);

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
    if (submissionInProgress.current) {
      console.log("Submission already in progress, ignoring");
      return;
    }

    submissionInProgress.current = true;
    console.log("Starting signup form submission");

    setApiError(null);

    try {
      const passwordReqs = [];
      const password = formData.password || "";

      if (password.length < 8) passwordReqs.push("at least 8 characters");
      if (!/\d/.test(password)) passwordReqs.push("at least one number");
      if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password))
        passwordReqs.push("at least one special character");
      if (!/[A-Z]/.test(password))
        passwordReqs.push("at least one uppercase letter");

      if (passwordReqs.length > 0) {
        const validationError = {
          type: ERROR_TYPES.VALIDATION_ERROR,
          message: `Password must contain ${passwordReqs.join(", ")}`,
          details: {
            password: `Password must contain ${passwordReqs.join(", ")}`,
          },
        };
        console.error("Password requirements error:", validationError);
        throw validationError;
      }

      const result = await signUp({
        email: formData.email,
        password: formData.password,
        displayName: formData.email.split("@")[0],
      });

      console.log("Sign up successful:", result);

      setApiError({
        type: "success",
        message:
          "Account created successfully! Please check your inbox for a confirmation email.",
      });

      return result;
    } catch (err) {
      console.error("Signup form error:", err);

      // Process the error through our centralized error service
      const standardError = processApiError(err, {
        defaultMessage: "Failed to create account",
      });
      setApiError(standardError);

      throw err; // Rethrow to let useForm handle isSubmitting state
    } finally {
      console.log("Signup form submission completed");
      submissionInProgress.current = false;
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
              isSubmitting={isSubmitting || authLoading}
              apiError={apiError}
              passwordRequirements={passwordRequirements}
            />
          </ConsoleSection>
        </ConsoleWindow>
      </div>
    </>
  );
}
