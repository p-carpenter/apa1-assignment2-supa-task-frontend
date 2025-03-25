"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/app/contexts/AuthContext";
import { useForm } from "@/app/hooks/useForm";
import { validateAuthForm } from "@/app/utils/validation/formValidation";
import { LoginForm } from "@/app/components/forms";
import authStyles from "@/app/components/forms/Auth.module.css";
import terminalStyles from "@/app/components/ui/console/Terminal.module.css";
import { processApiError } from "@/app/utils/errors/errorService";
import { FormFooterLinks } from "@/app/components/forms/fields";

import {
  ConsoleWindow,
  ConsoleSection,
  CommandOutput,
} from "../components/ui/console";

/**
 * Login page component that handles user authentication
 * Provides a form for users to enter their credentials and manages the login process
 */
const LoginPage = () => {
  const { isAuthenticated, isLoading, signIn } = useAuth();
  const router = useRouter();
  const [apiError, setApiError] = useState(null);
  const submissionInProgress = useRef(false);

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      router.push("/profile");
    }
  }, [isAuthenticated, isLoading, router]);

  /**
   * Handles the form submission for user login
   * @param {Object} formData - The form data containing email and password
   */
  const handleFormSubmit = async (formData) => {
    if (submissionInProgress.current) {
      return;
    }

    submissionInProgress.current = true;
    setApiError(null);

    try {
      await signIn({
        email: formData.email,
        password: formData.password,
      });
    } catch (err) {
      const standardError = processApiError(err, {
        defaultMessage: "An error occurred during login",
      });
      setApiError(standardError);

      setTimeout(() => {
        submissionInProgress.current = false;
      }, 0);

      throw err;
    } finally {
      submissionInProgress.current = false;
    }
  };

  const initialFormState = {
    email: "",
    password: "",
  };

  /**
   * Validates the login form fields
   * @param {Object} data - The form data to validate
   * @param {string} fieldName - The name of the field to validate
   * @returns {Object} Validation errors for the form
   */
  const validateFormFunction = (data, fieldName) => {
    return validateAuthForm(data, fieldName);
  };

  const { formData, formErrors, isSubmitting, handleChange, handleSubmit } =
    useForm(initialFormState, validateFormFunction, handleFormSubmit);

  // Status items for the console footer
  const statusItems = [
    "TECH INCIDENTS ARCHIVE",
    "USER AUTHENTICATION",
    { text: "AWAITING CREDENTIALS", blink: true },
  ];

  return (
    <>
      <div className={authStyles.pageContainer}>
        <ConsoleWindow
          title="tech-incidents-login"
          statusItems={statusItems}
          className={authStyles.console}
        >
          <ConsoleSection
            data-testid="console-section"
            command="security --auth"
            commandParts={{
              baseCommand: "security",
              flags: ["--auth"],
            }}
          >
            <CommandOutput
              title="USER LOGIN"
              showGlitch={true}
              showLoadingBar={true}
            >
              <div className={terminalStyles.outputText}>
                Authentication required for secure access.
              </div>
              <div
                className={`${terminalStyles.outputText} ${terminalStyles.highlight}`}
              >
                PLEASE ENTER YOUR CREDENTIALS
              </div>
            </CommandOutput>

            <LoginForm
              formData={formData}
              formErrors={formErrors}
              handleChange={handleChange}
              handleSubmit={handleSubmit}
              isSubmitting={isSubmitting || isLoading}
              apiError={apiError}
            />

            <FormFooterLinks
              links={[
                {
                  label: "Don't have access?",
                  href: "/signup",
                  text: "Register account",
                },
                {
                  label: "Forgot password?",
                  href: "/reset_password",
                  text: "Reset password",
                },
              ]}
            />
          </ConsoleSection>
        </ConsoleWindow>
      </div>
    </>
  );
};

export default LoginPage;
