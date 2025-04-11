import React from "react";
import styles from "../FormStyles.module.css";
import terminalStyles from "@/app/components/ui/console/Terminal.module.css";

/**
 * Reusable text input field component with error handling and styling.
 * 
 * @param {string} id - The ID of the input field
 * @param {string} name - The name attribute of the input field
 * @param {React.ReactNode} label - The label for the input field
 * @param {string} value - The current value of the input field
 * @param {Function} onChange - Handler for when the input value changes
 * @param {string} [placeholder] - Placeholder text for the input field
 * @param {string} [error] - Error message to display
 * @param {boolean} [required=false] - Whether the field is required
 * @param {string} [type="text"] - The type of input field
 * @param {boolean} [disabled=false] - Whether the field is disabled
 * @param {string} [helperText] - Helper text to display below the input field
 * @param {string} [className=""] - Additional CSS class names
 * @param {boolean} [usePrompt=false] - Whether to display terminal-style prompt
 * @param {Object} [props] - Additional props to pass to the input element
 */
const TextField = ({
  id,
  name,
  label,
  value,
  onChange,
  placeholder,
  error,
  required = false,
  type = "text",
  disabled = false,
  helperText,
  className = "",
  usePrompt = false,
  ...props
}) => {
  return (
    <div className={`${styles.formGroup} ${className}`}>
      <label className={styles.formLabel} htmlFor={id || name}>
        {usePrompt ? (
          <>
            <span className={terminalStyles.prompt}>$</span> {label}
          </>
        ) : (
          label
        )}{" "}
        {required && <span style={{ color: "red" }}>*</span>}
      </label>
      <input
        id={id || name}
        name={name}
        type={type}
        className={`${styles.formInput} ${error ? styles.inputError : ""}`}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        disabled={disabled}
        required={required}
        {...props}
      />
      {helperText && <small className={styles.helperText}>{helperText}</small>}
      {error && <div className={styles.formError}>{error}</div>}
    </div>
  );
};

export default TextField;