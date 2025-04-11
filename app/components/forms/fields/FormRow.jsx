import React from "react";
import formStyles from "../FormStyles.module.css";

/**
 * Component for creating horizontal rows of form fields
 * Used to organize multiple fields in a single row
 * 
 * @param {ReactNode} children - Child components to render in the row
 * @param {string} className - Additional CSS class names
 */
const FormRow = ({ children, className = "" }) => {
  return (
    <div className={`${formStyles.formRow} ${className}`}>
      {children}
    </div>
  );
};

export default FormRow;