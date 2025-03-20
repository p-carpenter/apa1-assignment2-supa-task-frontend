"use client";

import React from "react";
import { ApiErrorMessage } from "../ui/errors";
import authStyles from "./Auth.module.css";
import {
  TextField,
  PasswordField,
  FormFooterLinks,
  FormButtons,
  PromptLabel,
} from "./fields";

function SignupForm({
  formData,
  formErrors,
  handleChange,
  handleSubmit,
  isSubmitting,
  errorMessage,
  apiError,
  passwordRequirements,
}) {
  return (
    <div className={authStyles.formContainer}>
      <div className={authStyles.header}>
        <h2 className={authStyles.title}>CREATE ACCOUNT</h2>
        <p className={authStyles.subtitle}>Register for archive access</p>
      </div>

      {apiError && <ApiErrorMessage error={apiError} />}

      <form className={authStyles.form} onSubmit={handleSubmit} noValidate>
        <TextField
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
          id="password"
          name="password"
          label={<PromptLabel>PASSWORD</PromptLabel>}
          autoComplete="new-password"
          value={formData.password}
          onChange={handleChange}
          disabled={isSubmitting}
          error={formErrors.password}
        />

        {passwordRequirements && passwordRequirements.length > 0 && (
          <div style={{ marginTop: "-10px", marginBottom: "15px" }}>
            {passwordRequirements.map((req) => (
              <div key={req.key} className={authStyles.passwordRequirement}>
                {req.value}
              </div>
            ))}
          </div>
        )}

        <PasswordField
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

      <FormFooterLinks
        links={[
          {
            label: "Already have an account?",
            href: "/login",
            text: "Login here",
          },
        ]}
      />
    </div>
  );
}

export default SignupForm;
