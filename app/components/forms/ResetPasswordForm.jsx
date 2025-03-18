import React from "react";
import { TextField } from "./fields";
import authStyles from "./Auth.module.css";
import formStyles from "./FormStyles.module.css";

const ResetPasswordForm = ({
  formData,
  formErrors,
  handleChange,
  handleSubmit,
  isSubmitting,
  hasError,
  buttonText = "SEND RESET LINK",
}) => {
  return (
    <form className={authStyles.form} onSubmit={handleSubmit} noValidate>
      <TextField
        id="email"
        name="email"
        type="email"
        label="EMAIL"
        autoComplete="email"
        className={formStyles.formGroup}
        value={formData.email}
        onChange={handleChange}
        placeholder="user@example.com"
        disabled={isSubmitting}
        error={formErrors.email}
        usePrompt={true}
      />

      <button
        type="submit"
        className={`${authStyles.authButton} ${authStyles.authSubmit}`}
        disabled={isSubmitting}
        data-testid="reset-password-button"
      >
        {isSubmitting ? (
          <>
            <span className={authStyles.authLoading}></span>
            PROCESSING...
          </>
        ) : (
          buttonText
        )}
      </button>
    </form>
  );
};

export default ResetPasswordForm;
