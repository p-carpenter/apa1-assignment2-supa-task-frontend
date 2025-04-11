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
import { ApiMessage } from "@/app/components/forms/ApiMessage";
import { FormFooterLinks } from "@/app/components/forms/fields";

import {
  ConsoleWindow,
  ConsoleSection,
  CommandOutput,
} from "../components/ui/console";

/**
 * User registration page component
 * Provides a form for new users to create an account with email and password
 * Handles form validation and account creation process
 */
const SignupPage = () => {
  const { isLoading: authLoading, signUp } = useAuth();
  const [apiError, setApiError] = useState(null);
  const [successMessage, setSuccessMessage] = useState("");
  const submissionInProgress = useRef(false);

  /**
   * Handles the form submission for user registration
   * @param {Object} formData - The form data containing email and password
   * @returns {Object} Result of the signup operation
   */
  const handleFormSubmit = async (formData) => {
    if (submissionInProgress.current) {
      return;
    }

    submissionInProgress.current = true;
    setApiError(null);
    setSuccessMessage("");

    try {
      const result = await signUp({
        email: formData.email,
        password: formData.password,
        displayName: formData.email.split("@")[0],
      });

      setSuccessMessage("Account created successfully! You can now login.");

      return result;
    } catch (err) {
      submissionInProgress.current = false;
      if (err.message === "Password doesn't meet security requirements") {
        setApiError({
          type: ERROR_TYPES.BAD_REQUEST,
          message: err.message,
        });
      } else {
        const standardError = processApiError(err, {
          defaultMessage: "Failed to create account",
        });
        setApiError(standardError);
      }
    } finally {
      submissionInProgress.current = false;
    }
  };

  const initialFormState = {
    email: "",
    password: "",
    confirmPassword: "",
  };

  /**
   * Validates the signup form fields with enhanced password requirements
   * @param {Object} data - The form data to validate
   * @param {string} fieldName - The name of the field to validate
   * @returns {Object} Validation errors for the form
   */
  const formValidationFunction = (data, fieldName) => {
    return validateAuthForm(data, fieldName, {
      options: {
        requirePasswordConfirmation: true,
        minLength: 8,
        requireUppercase: true,
        requireNumbers: true,
        requireSpecial: true,
      },
    });
  };

  const {
    formData,
    formErrors,
    isSubmitting,
    handleChange: formHandleChange,
    handleSubmit,
  } = useForm(initialFormState, formValidationFunction, handleFormSubmit);

  /**
   * Handles form field changes
   * @param {Event} e - The change event
   */
  const handleChange = (e) => {
    formHandleChange(e);
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
              handleChange={handleChange}
              handleSubmit={handleSubmit}
              isSubmitting={isSubmitting || authLoading}
              apiError={apiError}
              successMessage={successMessage}
            />

            {!successMessage && (
              <FormFooterLinks
                links={[
                  {
                    label: "Already have an account?",
                    href: "/login",
                    text: "Login here",
                  },
                ]}
              />
            )}
          </ConsoleSection>
        </ConsoleWindow>
      </div>
    </>
  );
};

export default SignupPage;
