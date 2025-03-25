import React from "react";
import styles from "../FormStyles.module.css";

/**
 * File upload input field component with error handling and styling.
 * 
 * @param {string} id - The ID of the file input field
 * @param {string} name - The name attribute of the file input field
 * @param {React.ReactNode} label - The label for the file input field
 * @param {Function} onChange - Handler for when files are selected
 * @param {string} [accept] - Accepted file types (e.g., ".pdf,.jpg,.png")
 * @param {string} [error] - Error message to display
 * @param {boolean} [required=false] - Whether the field is required
 * @param {boolean} [disabled=false] - Whether the field is disabled
 * @param {string} [helperText] - Helper text to display below the file input field
 * @param {string} [className=""] - Additional CSS class names
 * @param {boolean} [hideLabel=false] - Whether to hide the field label
 * @param {Object} [props] - Additional props to pass to the input element
 */
const FileField = ({
  id,
  name,
  label,
  onChange,
  accept,
  error,
  required = false,
  disabled = false,
  helperText,
  className = "",
  hideLabel = false,
  ...props
}) => {
  return (
    <div className={`${styles.formGroup} ${className}`}>
      {!hideLabel && (
        <label className={styles.formLabel} htmlFor={id || name}>
          {label} {required && "*"}
        </label>
      )}
      <input
        id={id || name}
        name={name}
        type="file"
        accept={accept}
        className={`${styles.formInput} ${error ? styles.inputError : ""}`}
        onChange={onChange}
        disabled={disabled}
        {...props}
      />
      {helperText && <small className={styles.helperText}>{helperText}</small>}
      {error && <div className={styles.formError}>{error}</div>}
    </div>
  );
};

export default FileField;