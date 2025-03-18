"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/app/contexts/AuthContext";
import authStyles from "./Auth.module.css";
import { FormValidationError } from "../ui/errors";
import { resolveError } from "../../utils/api/errors/errorHandling";
import {
  TextField,
  PasswordField,
  FormErrorMessage,
  FormFooterLinks,
  FormButtons,
  PromptLabel
} from "./fields";

function LoginForm({ apiError: externalApiError, onError, onRetry: externalRetry, onDismiss: externalDismiss }) {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [formErrors, setFormErrors] = useState({});
  const [errorMessage, setErrorMessage] = useState("");
  const [internalError, setInternalError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { signIn, loading: authLoading } = useAuth();

  // Use centralized error resolution logic
  const error = resolveError(externalApiError, internalError, errorMessage);

  // Combine component's internal loading state with auth context loading state
  const loading = isSubmitting || authLoading;
  
  // Clear internal error when external error changes
  useEffect(() => {
    if (externalApiError) {
      setInternalError(null);
      setErrorMessage("");
    }
  }, [externalApiError]);

  // Validate a single field
  const validateField = (name, value) => {
    let error = null;

    switch (name) {
      case "email":
        if (!value.trim()) {
          error = "Email is required.";
        } else {
          // Email format validation
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          if (!emailRegex.test(value)) {
            error = "Please enter a valid email address.";
          }
        }
        break;

      case "password":
        if (!value.trim()) {
          error = "Password is required.";
        } else if (value.length < 8) {
          error = "Password must be at least 8 characters long.";
        } else {
          // Check for password requirements
          const hasNumber = /[0-9]/.test(value);
          const hasSpecialChar = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(
            value
          );
          const hasUpperCase = /[A-Z]/.test(value);

          if (!hasNumber) {
            error = "Password must contain at least one number.";
          } else if (!hasSpecialChar) {
            error = "Password must contain at least one special character.";
          } else if (!hasUpperCase) {
            error = "Password must contain at least one uppercase letter.";
          }
        }
        break;

      default:
        break;
    }

    return error;
  };

  const validateFields = () => {
    const errors = {};

    const emailError = validateField("email", formData.email);
    if (emailError) errors.email = emailError;

    const passwordError = validateField("password", formData.password);
    if (passwordError) errors.password = passwordError;

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Clear error state when user starts typing
    setInternalError(null);
    setErrorMessage("");

    // Validate field as user types and update errors
    const error = validateField(name, value);
    setFormErrors((prev) => ({
      ...prev,
      [name]: error,
    }));
  };

  const handleRetry = () => {
    if (externalApiError && externalRetry) {
      externalRetry();
    } else {
      setInternalError(null);
      setErrorMessage("");
      handleSubmit(new Event('submit'));
    }
  };

  const handleDismiss = () => {
    if (externalApiError && externalDismiss) {
      externalDismiss();
    } else {
      setInternalError(null);
      setErrorMessage("");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage("");
    setInternalError(null);

    if (!validateFields()) {
      return;
    }

    setIsSubmitting(true);

    try {
      await signIn({
        email: formData.email,
        password: formData.password,
      });
      // Redirect is handled by useEffect in the LoginPage component
    } catch (err) {
      // Use the standardized error object if available
      if (err.type) {
        if (onError) {
          onError(err);
        } else {
          setInternalError(err);
        }
      } else {
        setErrorMessage(err.message || "Failed to sign in");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Determine if we should show field validation errors
  const showFieldErrors = Object.keys(formErrors).some(key => formErrors[key]) && 
                         !isSubmitting;

  return (
    <div className={authStyles.formContainer}>
      <div className={authStyles.header}>
        <h2 className={authStyles.title}>SYSTEM ACCESS</h2>
        <p className={authStyles.subtitle}>
          Enter credentials to access archive
        </p>
      </div>

      <FormErrorMessage 
        error={error} 
        message={errorMessage}
        onRetry={handleRetry}
        onDismiss={handleDismiss}
        useAuthStyle={true}
      />

      {/* Only show field validation errors if there are any and we're not submitting */}
      {showFieldErrors && (
        <FormValidationError fieldErrors={formErrors} />
      )}

      <form className={authStyles.form} onSubmit={handleSubmit} noValidate>
        <TextField
          id="email"
          name="email"
          type="email"
          label={<PromptLabel>EMAIL</PromptLabel>}
          autoComplete="email"
          value={formData.email}
          onChange={handleChange}
          placeholder="user@example.com"
          disabled={loading}
          error={formErrors.email}
        />

        <PasswordField
          id="password"
          name="password"
          label={<PromptLabel>PASSWORD</PromptLabel>}
          value={formData.password}
          onChange={handleChange}
          error={formErrors.password}
          disabled={loading}
          helperText="Password must be at least 8 characters and include one number, one special character, and one uppercase letter."
        />

        <FormButtons
          submitLabel="LOGIN"
          loadingLabel="AUTHENTICATING..."
          useAuthStyle={true}
          testId="login-button"
          isSubmitting={loading}
        />
      </form>

      <FormFooterLinks
        links={[
          {
            label: "Don't have access?",
            href: "/signup",
            text: "Register account"
          },
          {
            label: "Forgot password?",
            href: "/reset_password",
            text: "Reset password"
          }
        ]}
      />
    </div>
  );
}

export default LoginForm;