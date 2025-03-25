import React from "react";
import { ApiMessage } from "./ApiMessage";
import { TextField, FormButtons, PromptLabel } from "./fields";
import authStyles from "./Auth.module.css";

/**
 * Form component for requesting a password reset link.
 *
 * @param {Object} formData - The current form data state
 * @param {Object} formErrors - Form validation errors
 * @param {Function} handleChange - Function to handle input changes
 * @param {Function} handleSubmit - Function to handle form submission
 * @param {boolean} isSubmitting - Whether the form is currently submitting
 * @param {Object|null} apiError - Error response from the API
 * @param {string} [buttonText="SEND RESET LINK"] - Custom text for the submit button
 */
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
      {apiError && <ApiMessage response={apiError} />}

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
