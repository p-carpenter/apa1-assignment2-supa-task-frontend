import React from "react";
import styles from "../FormStyles.module.css";

/**
 * Dropdown select field component with error handling and styling.
 * 
 * @param {string} id - The ID of the select field
 * @param {string} name - The name attribute of the select field
 * @param {React.ReactNode} label - The label for the select field
 * @param {string} value - The current value of the select field
 * @param {Function} onChange - Handler for when the selected value changes
 * @param {Array<Object|string>} [options=[]] - Options for the select field. Can be an array of strings or objects with value and label properties
 * @param {string} [error] - Error message to display
 * @param {boolean} [required=false] - Whether the field is required
 * @param {boolean} [disabled=false] - Whether the field is disabled
 * @param {string} [helperText] - Helper text to display below the select field
 * @param {string} [className=""] - Additional CSS class names
 * @param {Object} [props] - Additional props to pass to the select element
 */
const SelectField = ({
  id,
  name,
  label,
  value,
  onChange,
  options = [],
  error,
  required = false,
  disabled = false,
  helperText,
  className = "",
  ...props
}) => {
  return (
    <div className={`${styles.formGroup} ${className}`}>
      <label className={styles.formLabel} htmlFor={id || name}>
        {label} {required && <span style={{ color: "red" }}>*</span>}
      </label>
      <select
        id={id || name}
        name={name}
        className={`${styles.formSelect} ${error ? styles.inputError : ""}`}
        value={value}
        onChange={onChange}
        disabled={disabled}
        {...props}
      >
        {options.map((option) => (
          <option key={option.value || option} value={option.value || option}>
            {option.label || option}
          </option>
        ))}
      </select>
      {helperText && <small className={styles.helperText}>{helperText}</small>}
      {error && <div className={styles.formError}>{error}</div>}
    </div>
  );
};

export default SelectField;