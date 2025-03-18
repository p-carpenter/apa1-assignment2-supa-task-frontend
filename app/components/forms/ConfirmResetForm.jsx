import React from "react";
import { TextField } from "./fields";
import authStyles from "./Auth.module.css";

const ConfirmResetForm = ({
  formData,
  formErrors,
  handleChange,
  handleSubmit,
  isSubmitting,
  hasError,
}) => {
  return (
    <form className={authStyles.form} onSubmit={handleSubmit} noValidate>
      <TextField
        id="email"
        name="email"
        type="email"
        label="EMAIL"
        autoComplete="email"
        value={formData.email}
        onChange={handleChange}
        placeholder="user@example.com"
        disabled={isSubmitting}
        error={formErrors.email}
        usePrompt={true}
      />

      <TextField
        id="password"
        name="password"
        type="password"
        label="NEW PASSWORD"
        autoComplete="new-password"
        value={formData.password}
        onChange={handleChange}
        placeholder="••••••••"
        disabled={isSubmitting}
        error={formErrors.password}
        usePrompt={true}
        helperText="Password must be at least 8 characters and include one number, one special character, and one uppercase letter."
      />

      <TextField
        id="confirmPassword"
        name="confirmPassword"
        type="password"
        label="CONFIRM PASSWORD"
        autoComplete="new-password"
        value={formData.confirmPassword}
        onChange={handleChange}
        placeholder="••••••••"
        disabled={isSubmitting}
        error={formErrors.confirmPassword}
        usePrompt={true}
      />

      <button
        type="submit"
        className={`${authStyles.authButton} ${authStyles.authSubmit}`}
        disabled={isSubmitting}
        data-testid="confirm-reset-button"
      >
        {isSubmitting ? (
          <>
            <span className={authStyles.authLoading}></span>
            PROCESSING...
          </>
        ) : (
          "RESET PASSWORD"
        )}
      </button>
    </form>
  );
};

export default ConfirmResetForm;
