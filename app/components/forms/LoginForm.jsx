"use client";

import React from "react";
import authStyles from "./Auth.module.css";
import { ApiErrorMessage } from "../ui/errors";
import {
  TextField,
  PasswordField,
  FormFooterLinks,
  FormButtons,
  PromptLabel,
} from "./fields";

function LoginForm({
  formData,
  formErrors,
  handleChange,
  handleSubmit,
  isSubmitting,
  errorMessage,
  apiError,
}) {
  return (
    <div className={authStyles.formContainer}>
      <div className={authStyles.header}>
        <h2 className={authStyles.title}>SYSTEM ACCESS</h2>
        <p className={authStyles.subtitle}>
          Enter credentials to access archive
        </p>
      </div>

      {apiError && <ApiErrorMessage error={apiError} />}

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
          helperText="Password must be at least 8 characters and include one number, one special character, and one uppercase letter."
        />

        <FormButtons
          submitLabel="LOGIN"
          loadingLabel="AUTHENTICATING..."
          useAuthStyle={true}
          testId="login-button"
          isSubmitting={isSubmitting}
        />
      </form>

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
    </div>
  );
}

export default LoginForm;
