"use client";

import React from "react";
import Link from "next/link";
import { ApiMessage } from "./ApiMessage";
import authStyles from "./Auth.module.css";
import { TextField, PasswordField, FormButtons, PromptLabel } from "./fields";

/**
 * Component for handling user registration and account creation.
 *
 * @param {Object} formData - The current form data state
 * @param {Object} formErrors - Form validation errors
 * @param {Function} handleChange - Function to handle input changes
 * @param {Function} handleSubmit - Function to handle form submission
 * @param {boolean} isSubmitting - Whether the form is currently submitting
 * @param {Object|null} apiError - Error response from the API
 * @param {string|null} successMessage - Success message to display after registration
 */
const SignupForm = ({
  formData,
  formErrors,
  handleChange,
  handleSubmit,
  isSubmitting,
  apiError,
  successMessage,
}) => {
  return (
    <div className={authStyles.formContainer}>
      <div className={authStyles.header}>
        <h2 className={authStyles.title}>
          {successMessage ? "ACCOUNT CREATED" : "CREATE ACCOUNT"}
        </h2>
        <p className={authStyles.subtitle}>
          {successMessage
            ? "Registration complete"
            : "Register for archive access"}
        </p>
      </div>

      {apiError && <ApiMessage response={apiError} />}

      {successMessage ? (
        <>
          <ApiMessage response={{ type: "success", message: successMessage }} />
          <div className={authStyles.authFooter}>
            <p>
              <Link href="/login" className={authStyles.authLink}>
                Proceed to login
              </Link>
            </p>
          </div>
        </>
      ) : (
        <form className={authStyles.form} onSubmit={handleSubmit} noValidate>
          <TextField
            data-testid="email-field"
            id="email"
            name="email"
            type="email"
            label={<PromptLabel>EMAIL</PromptLabel>}
            autoComplete="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="your@email.com"
            disabled={isSubmitting}
            error={formErrors.email}
          />

          <PasswordField
            data-testid="password-field"
            id="password"
            name="password"
            label={<PromptLabel>PASSWORD</PromptLabel>}
            autoComplete="new-password"
            value={formData.password}
            onChange={handleChange}
            disabled={isSubmitting}
            error={formErrors.password}
            helperText="Password must be at least 8 characters and include one number, one special character, and one uppercase letter."
          />

          <PasswordField
            data-testid="confirmPassword-field"
            id="confirmPassword"
            name="confirmPassword"
            label={<PromptLabel>CONFIRM PASSWORD</PromptLabel>}
            autoComplete="new-password"
            value={formData.confirmPassword}
            onChange={handleChange}
            placeholder="Re-enter password"
            disabled={isSubmitting}
            error={formErrors.confirmPassword}
          />

          <FormButtons
            submitLabel="CREATE ACCOUNT"
            loadingLabel="REGISTERING..."
            useAuthStyle={true}
            testId="signup-button"
            isSubmitting={isSubmitting}
          />
        </form>
      )}
    </div>
  );
};

export default SignupForm;
