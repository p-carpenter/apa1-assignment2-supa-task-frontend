import React from "react";
import { ApiErrorMessage, FormValidationError } from "../ui/errors";
import {
  TextField,
  PasswordField,
  FormButtons,
  FormErrorMessage,
  PromptLabel,
} from "./fields";
import authStyles from "./Auth.module.css";

const ConfirmResetForm = ({
  formData,
  formErrors,
  handleChange,
  handleSubmit,
  isSubmitting,
  errorMessage,
  apiError,
  onRetry,
  onDismiss,
}) => {
  const hasFieldErrors = Object.keys(formErrors).some((key) => formErrors[key]);

  return (
    <>
      {apiError ? (
        <ApiErrorMessage
          error={apiError}
          onRetry={onRetry}
          onDismiss={onDismiss}
        />
      ) : (
        <FormErrorMessage message={errorMessage} useAuthStyle={true} />
      )}

      {hasFieldErrors && <FormValidationError fieldErrors={formErrors} />}

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
          disabled={isSubmitting}
          error={formErrors.email}
          required
        />

        <PasswordField
          id="password"
          name="password"
          label={<PromptLabel>NEW PASSWORD</PromptLabel>}
          autoComplete="new-password"
          value={formData.password}
          onChange={handleChange}
          disabled={isSubmitting}
          error={formErrors.password}
          required
          helperText="Password must be at least 8 characters and include one number, one special character, and one uppercase letter."
        />

        <PasswordField
          id="confirmPassword"
          name="confirmPassword"
          label={<PromptLabel>CONFIRM PASSWORD</PromptLabel>}
          autoComplete="new-password"
          value={formData.confirmPassword}
          onChange={handleChange}
          disabled={isSubmitting}
          error={formErrors.confirmPassword}
          required
        />

        <FormButtons
          submitLabel="RESET PASSWORD"
          loadingLabel="PROCESSING..."
          useAuthStyle={true}
          testId="confirm-reset-button"
          isSubmitting={isSubmitting}
        />
      </form>
    </>
  );
};

export default ConfirmResetForm;
