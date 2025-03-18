"use client";

import React from 'react';
import { getErrorMessage, isValidError, hasErrorMessage } from '../../../utils/api/errors/errorHandling';
import styles from './ErrorMessage.module.css';

/**
 * Displays standardized error messages for API errors
 */
export const ApiErrorMessage = ({ 
  error, 
  className = '', 
  onRetry = null,
  onDismiss = null 
}) => {
  if (!isValidError(error)) return null;
  
  const message = getErrorMessage(error);
  
  if (!hasErrorMessage(message)) return null;
  
  return (
    <div className={`${styles.errorContainer} ${className}`}>
      <div className={styles.errorContent}>
        <span className={styles.errorIcon}>⚠️</span>
        <p className={styles.errorText}>{message}</p>
        
        {(onRetry || onDismiss) && (
          <div className={styles.errorActions}>
            {onRetry && (
              <button 
                onClick={onRetry} 
                className={styles.retryButton}
              >
                Try Again
              </button>
            )}
            
            {onDismiss && (
              <button 
                onClick={onDismiss}
                className={styles.dismissButton}
              >
                Dismiss
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

/**
 * Displays validation errors for forms
 */
export const FormValidationError = ({ 
  error, 
  fieldErrors 
}) => {
  const hasValidMainError = hasErrorMessage(error);
  const hasValidFieldErrors = fieldErrors && 
    Object.keys(fieldErrors).some(key => hasErrorMessage(fieldErrors[key]));
  
  if (!hasValidMainError && !hasValidFieldErrors) {
    return null;
  }
  
  return (
    <div className={styles.validationContainer}>
      {hasValidMainError && (
        <p className={styles.validationSummary}>{error}</p>
      )}
      
      {hasValidFieldErrors && (
        <ul className={styles.validationList}>
          {Object.entries(fieldErrors)
            .filter(([_, message]) => hasErrorMessage(message))
            .map(([field, message]) => (
              <li key={field} className={styles.validationItem}>
                {message}
              </li>
            ))}
        </ul>
      )}
    </div>
  );
};

export default {
  ApiErrorMessage,
  FormValidationError
};