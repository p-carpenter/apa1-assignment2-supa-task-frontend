import React from "react";
import formStyles from "@/app/components/forms/FormStyles.module.css";
import authStyles from "@/app/components/forms/Auth.module.css";
import { ApiErrorMessage } from ".";
import {
  isValidError,
  hasErrorMessage,
  resolveFormError,
} from "../../../utils/errors/errorService";

/**
 * Component for displaying form-level error messages
 * Supports both auth form styling and standard form styling
 */
const FieldLevelErrorMessage = ({
  message,
  useAuthStyle = false,
  className = "",
  error = null,
}) => {
  // Resolve the error to display using centralized logic
  const resolvedError = resolveFormError(error, null, { message });

  if (isValidError(resolvedError)) {
    return <ApiErrorMessage error={resolvedError} className={className} />;
  }

  if (!hasErrorMessage(message)) return null;

  const errorClass = useAuthStyle
    ? `${authStyles.authError} ${className}`
    : `${formStyles.formErrorMessage} ${className}`;

  return (
    <div className={errorClass} role="alert">
      {message}
    </div>
  );
};

export default FieldLevelErrorMessage;
