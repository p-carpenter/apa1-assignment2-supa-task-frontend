import React from "react";
import styles from "../FormStyles.module.css";

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
