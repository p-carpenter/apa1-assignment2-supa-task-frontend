import React from "react";
import styles from "../FormStyles.module.css";

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
