import React, { useState } from "react";
import styles from "../FormStyles.module.css";
import terminalStyles from "@/app/components/ui/console/Terminal.module.css";

/**
 * Password input field with show/hide toggle functionality.
 * 
 * @param {string} id - The ID of the password field
 * @param {string} name - The name attribute of the password field
 * @param {React.ReactNode} label - The label for the password field
 * @param {string} value - The current value of the password field
 * @param {Function} onChange - Handler for when the password value changes
 * @param {string} [error] - Error message to display
 * @param {boolean} [required=false] - Whether the field is required
 * @param {boolean} [disabled=false] - Whether the field is disabled
 * @param {string} [autoComplete="current-password"] - The autocomplete attribute value
 * @param {string} [placeholder="••••••••"] - Placeholder text for the password field
 * @param {string} [helperText] - Helper text to display below the password field
 * @param {string} [className=""] - Additional CSS class names
 * @param {boolean} [usePrompt=false] - Whether to display terminal-style prompt
 * @param {boolean} [showToggle=true] - Whether to show the password visibility toggle button
 * @param {Object} [props] - Additional props to pass to the input element
 */
const PasswordField = ({
  id,
  name,
  label,
  value,
  onChange,
  error,
  required = false,
  disabled = false,
  autoComplete = "current-password",
  placeholder = "••••••••",
  helperText,
  className = "",
  usePrompt = false,
  showToggle = true,
  ...props
}) => {
  const [showPassword, setShowPassword] = useState(false);

  const togglePasswordVisibility = (e) => {
    e.preventDefault();
    setShowPassword(!showPassword);
  };

  return (
    <div className={`${styles.formGroup} ${className}`}>
      <label className={styles.formLabel} htmlFor={id || name}>
        {usePrompt && <span className={terminalStyles.prompt}>$</span>} {label}{" "}
        {required && "*"}
      </label>
      <div className={styles.passwordInputWrapper}>
        <input
          id={id || name}
          name={name}
          type={showPassword ? "text" : "password"}
          className={`${styles.formInput} ${error ? styles.inputError : ""}`}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          disabled={disabled}
          autoComplete={autoComplete}
          {...props}
        />
        {showToggle && (
          <button
            type="button"
            className={styles.passwordToggle}
            onClick={togglePasswordVisibility}
            aria-label={showPassword ? "Hide password" : "Show password"}
            tabIndex="-1"
          >
            {showPassword ? "Hide" : "Show"}
          </button>
        )}
      </div>
      {helperText && <small className={styles.helperText}>{helperText}</small>}
      {error && <div className={styles.formError}>{error}</div>}
    </div>
  );
};

export default PasswordField;