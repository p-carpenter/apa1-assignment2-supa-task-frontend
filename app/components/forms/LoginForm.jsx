"use client";

import React from "react";
import authStyles from "./Auth.module.css";
import { ApiMessage } from "./ApiMessage";
import { TextField, PasswordField, FormButtons, PromptLabel } from "./fields";

/**
 * Component for handling user login.
 *
 * @param {Object} formData - The current form data state
 * @param {Object} formErrors - Form validation errors
 * @param {Function} handleChange - Function to handle input changes
 * @param {Function} handleSubmit - Function to handle form submission
 * @param {boolean} isSubmitting - Whether the form is currently submitting
 * @param {Object|null} apiError - Error response from the API
 */
const LoginForm = ({
  formData,
  formErrors,
  handleChange,
  handleSubmit,
  isSubmitting,
  apiError,
}) => {
  return (
    <div className={authStyles.formContainer}>
      <div className={authStyles.header}>
        <h2 className={authStyles.title}>SYSTEM ACCESS</h2>
        <p className={authStyles.subtitle}>
          Enter credentials to access archive
        </p>
      </div>

      {apiError && <ApiMessage response={apiError} />}

      <form
        className={authStyles.form}
        onSubmit={handleSubmit}
        noValidate
        data-testid="form"
      >
        <TextField
          data-testid="email-field"
          id="email"
          name="email"
          type="email"
          label={<PromptLabel>EMAIL</PromptLabel>}
          autoComplete="email"
          value={formData.email}
          onChange={handleChange}
          placeholder="user@example.com"
          disabled={isSubmitting}
          error={formErrors.email}
        />

        <PasswordField
          data-testid="password-field"
          id="password"
          name="password"
          label={<PromptLabel>PASSWORD</PromptLabel>}
          value={formData.password}
          onChange={handleChange}
          error={formErrors.password}
          disabled={isSubmitting}
        />

        <FormButtons
          submitLabel="LOGIN"
          loadingLabel="AUTHENTICATING..."
          useAuthStyle={true}
          testId="login-button"
          isSubmitting={isSubmitting}
        />
      </form>
    </div>
  );
};

export default LoginForm;
