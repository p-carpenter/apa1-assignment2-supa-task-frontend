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

import {
  ConsoleWindow,
  ConsoleSection,
  CommandOutput,
} from "../components/ui/console";

export default function LoginPage() {
  const { isAuthenticated, isLoading, signIn } = useAuth();
  const router = useRouter();
  const [apiError, setApiError] = useState(null);
  const submissionInProgress = useRef(false);

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      router.push("/profile");
    }
  }, [isAuthenticated, isLoading, router]);

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
      submissionInProgress.current = false;
    } catch (err) {
      const standardError = processApiError(err, {
        defaultMessage: "An error occurred during login",
      });
      setApiError(standardError);
      submissionInProgress.current = false;
    } finally {
      submissionInProgress.current = false;
    }
  };

  const initialFormState = {
    email: "",
    password: "",
  };

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
          </ConsoleSection>
        </ConsoleWindow>
      </div>
    </>
  );
}
