import React from "react";
import formStyles from "../FormStyles.module.css";
import authStyles from "../Auth.module.css";
import { ApiErrorMessage } from "../../ui/errors";
import { isValidError, hasErrorMessage, resolveError } from "../../../utils/api/errors/errorHandling";

/**
 * Component for displaying form-level error messages
 * Supports both auth form styling and standard form styling
 */
const FormErrorMessage = ({ 
  message, 
  useAuthStyle = false, 
  className = "",
  error = null,
  onRetry = null,
  onDismiss = null
}) => {
  // Resolve the error to display using centralized logic
  const resolvedError = resolveError(error, null, message);
  
  // If we have a standardized error object, use the ApiErrorMessage component
  if (isValidError(resolvedError)) {
    return (
      <ApiErrorMessage 
        error={resolvedError} 
        className={className}
        onRetry={onRetry}
        onDismiss={onDismiss}
      />
    );
  }
  
  // If we just have a string message, use the original implementation
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

export default FormErrorMessage;