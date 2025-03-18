import React from "react";
import formStyles from "../FormStyles.module.css";
import authStyles from "../Auth.module.css";

/**
 * Component for displaying form-level error messages
 * Supports both auth form styling and standard form styling
 */
const FormErrorMessage = ({ 
  message, 
  useAuthStyle = false, 
  className = "" 
}) => {
  if (!message) return null;
  
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