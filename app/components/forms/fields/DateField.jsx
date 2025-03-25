import React from "react";
import styles from "../FormStyles.module.css";

/**
 * Date input field component with error handling and styling.
 * 
 * @param {string} id - The ID of the date input field
 * @param {string} name - The name attribute of the date input field
 * @param {React.ReactNode} label - The label for the date input field
 * @param {string} value - The current value of the date input field
 * @param {Function} onChange - Handler for when the date value changes
 * @param {string} [format="DD-MM-YYYY"] - Display format for the date
 * @param {string} [error] - Error message to display
 * @param {boolean} [required=false] - Whether the field is required
 * @param {boolean} [disabled=false] - Whether the field is disabled
 * @param {string} [placeholder] - Placeholder text for the date field
 * @param {number} [maxLength=10] - Maximum number of characters for the input
 * @param {string} [helperText] - Helper text to display below the date field
 * @param {string} [className=""] - Additional CSS class names
 * @param {Object} [props] - Additional props to pass to the input element
 */
const DateField = ({
  id,
  name,
  label,
  value,
  onChange,
  format = "DD-MM-YYYY",
  error,
  required = false,
  disabled = false,
  placeholder,
  maxLength = 10,
  helperText,
  className = "",
  ...props
}) => {
  return (
    <div className={`${styles.formGroup} ${className}`}>
      <label className={styles.formLabel} htmlFor={id || name}>
        {label} {required && <span style={{ color: "red" }}>*</span>}
      </label>
      <input
        id={id || name}
        name={name}
        type="text"
        className={`${styles.formInput} ${error ? styles.inputError : ""}`}
        value={value}
        onChange={onChange}
        placeholder={placeholder || format}
        maxLength={maxLength}
        disabled={disabled}
        {...props}
      />
      {helperText && <small className={styles.helperText}>{helperText}</small>}
      {error && <div className={styles.formError}>{error}</div>}
    </div>
  );
};

export default DateField;