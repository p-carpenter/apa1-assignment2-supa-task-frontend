import React from "react";
import styles from "../FormStyles.module.css";

/**
 * Multiline text input field component with error handling and styling.
 * 
 * @param {string} id - The ID of the textarea field
 * @param {string} name - The name attribute of the textarea field
 * @param {React.ReactNode} label - The label for the textarea field
 * @param {string} value - The current value of the textarea field
 * @param {Function} onChange - Handler for when the textarea value changes
 * @param {string} [placeholder] - Placeholder text for the textarea field
 * @param {string} [error] - Error message to display
 * @param {boolean} [required=false] - Whether the field is required
 * @param {boolean} [disabled=false] - Whether the field is disabled
 * @param {number} [rows=4] - Number of visible text lines
 * @param {string} [helperText] - Helper text to display below the textarea field
 * @param {string} [className=""] - Additional CSS class names
 * @param {Object} [props] - Additional props to pass to the textarea element
 */
const TextArea = ({
  id,
  name,
  label,
  value,
  onChange,
  placeholder,
  error,
  required = false,
  disabled = false,
  rows = 4,
  helperText,
  className = "",
  ...props
}) => {
  return (
    <div className={`${styles.formGroup} ${className}`}>
      <label className={styles.formLabel} htmlFor={id || name}>
        {label} {required && <span style={{ color: "red" }}>*</span>}
      </label>
      <textarea
        id={id || name}
        name={name}
        className={`${styles.formTextarea} ${error ? styles.inputError : ""}`}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        disabled={disabled}
        rows={rows}
        {...props}
      />
      {helperText && <small className={styles.helperText}>{helperText}</small>}
      {error && <div className={styles.formError}>{error}</div>}
    </div>
  );
};

export default TextArea;