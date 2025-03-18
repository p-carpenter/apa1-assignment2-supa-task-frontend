import React from "react";
import styles from "../FormStyles.module.css";

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
        {label} {required && "*"}
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
