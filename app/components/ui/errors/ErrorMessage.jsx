"use client";

import React from "react";
import {
  getErrorMessage,
  isValidError,
  hasErrorMessage,
} from "../../../utils/errors/errorService";
import styles from "./ErrorMessage.module.css";

/**
 * Displays standardised error messages for API errors
 */
export const ApiErrorMessage = ({ error, className = "" }) => {
  if (!isValidError(error)) return null;

  const message = getErrorMessage(error);

  if (!hasErrorMessage(message)) return null;

  return (
    <div className={`${styles.errorContainer} ${className}`}>
      <div className={styles.errorContent}>
        <span className={styles.errorIcon}>⚠️</span>
        <p className={styles.errorText}>{message}</p>
      </div>
    </div>
  );
};

export default {
  ApiErrorMessage,
};
