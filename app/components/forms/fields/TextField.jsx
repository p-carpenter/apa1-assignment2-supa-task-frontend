import React from "react";
import styles from "../FormStyles.module.css";
import terminalStyles from "@/app/components/ui/console/Terminal.module.css";

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