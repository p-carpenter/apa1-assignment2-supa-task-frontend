import React from "react";
import { ApiErrorMessage } from "../ui/errors";
import { TextField, FormButtons, PromptLabel } from "./fields";
import authStyles from "./Auth.module.css";

const ResetPasswordForm = ({
  formData,
  formErrors,
  handleChange,
  handleSubmit,
  isSubmitting,
  apiError,
  buttonText = "SEND RESET LINK",
}) => {
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
          required
        />

        <FormButtons
          submitLabel={buttonText}
          loadingLabel="PROCESSING..."
          useAuthStyle={true}
          testId="reset-password-button"
          isSubmitting={isSubmitting}
          data-testid="reset-password-button"
        />
      </form>
    </>
  );
};

export default ResetPasswordForm;
