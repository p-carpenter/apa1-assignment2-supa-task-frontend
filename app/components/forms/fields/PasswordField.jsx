import React, { useState } from "react";
import styles from "../FormStyles.module.css";
import terminalStyles from "@/app/components/ui/console/Terminal.module.css";

/**
 * Password input field with show/hide toggle functionality
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
        {usePrompt && <span className={terminalStyles.prompt}>$</span>} {label} {required && "*"}
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