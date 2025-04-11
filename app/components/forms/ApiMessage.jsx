"use client";

import React from "react";
import {
  getErrorMessage,
  isValidError,
  hasErrorMessage,
} from "../../utils/errors/errorService";
import styles from "./ApiMessage.module.css";

/**
 * Displays standardised messages for API responses (errors and success)
 * Handles rendering of both error and success messages with appropriate styling
 *
 * @param {Object} response - The API response object containing error/success details
 * @param {string} response.type - Type of message ('error' or 'success')
 * @param {string} className - Additional CSS class names for styling customisation
 */
export const ApiMessage = ({ response, className = "" }) => {
  if (!isValidError(response)) {
    return null;
  }

  const message = getErrorMessage(response);
  const isSuccess = response.type === "success";

  if (!hasErrorMessage(message)) {
    return null;
  }

  return (
    <div
      className={`${isSuccess ? styles.successContainer : styles.errorContainer} ${className}`}
      data-testid={isSuccess ? "api-success" : "api-error"}
    >
      <div className={isSuccess ? styles.successContent : styles.errorContent}>
        <p className={isSuccess ? styles.successText : styles.errorText}>
          {message}
        </p>
      </div>
    </div>
  );
};

export default ApiMessage;
