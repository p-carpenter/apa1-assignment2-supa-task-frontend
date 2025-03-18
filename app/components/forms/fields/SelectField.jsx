import React from "react";
import styles from "../FormStyles.module.css";

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
        {label} {required && "*"}
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
