import React from "react";
import { ApiErrorMessage } from "../ui/errors";
import { TextField, PasswordField, FormButtons, PromptLabel } from "./fields";
import authStyles from "./Auth.module.css";

const ConfirmResetForm = ({
  formData,
  formErrors,
  handleChange,
  handleSubmit,
  isSubmitting,
  apiError,
}) => {

  const passwordMismatchError = 
    formData.password && 
    formData.confirmPassword && 
    formData.password !== formData.confirmPassword
      ? "Passwords do not match."
      : null;

  return (
    <>
      {apiError && <ApiErrorMessage error={apiError} />}

      <form
        className={authStyles.form}
        onSubmit={handleSubmit}
        data-testid="form"
        noValidate
      >
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
          error={formErrors.confirmPassword || passwordMismatchError}
          required
          data-testid="confirm-password-field"
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
