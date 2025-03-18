"use client";

import React, { useState } from "react";
import { useAuth } from "@/app/contexts/AuthContext";
import Link from "next/link";
import authStyles from "./Auth.module.css";
import formStyles from "./FormStyles.module.css";
import terminalStyles from "@/app/components/ui/console/Terminal.module.css";

function SignupForm() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [formErrors, setFormErrors] = useState({});
  const [errorMessage, setErrorMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { signUp } = useAuth();

  const validateField = (name, value) => {
    let error = null;

    switch (name) {
      case "email":
        if (!value.trim()) {
          error = "Email is required.";
        } else {
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          if (!emailRegex.test(value)) {
            error = "Please enter a valid email address.";
          }
        }
        break;

      case "password":
        if (!value.trim()) {
          error = "Password is required.";
        } else {
          const hasMinLength = value.length >= 8;
          const hasNumber = /\d/.test(value);
          const hasSpecialChar = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(
            value
          );
          const hasUpperCase = /[A-Z]/.test(value);

          setFormErrors((prev) => ({
            ...prev,
            passwordMinLength: hasMinLength
              ? null
              : "Password must be at least 8 characters long.",
            passwordNumber: hasNumber
              ? null
              : "Password must contain at least one number.",
            passwordSpecialChar: hasSpecialChar
              ? null
              : "Password must contain at least one special character.",
            passwordUpperCase: hasUpperCase
              ? null
              : "Password must contain at least one uppercase letter.",
          }));

          if (!hasMinLength || !hasNumber || !hasSpecialChar || !hasUpperCase) {
            error = "Please ensure all password requirements are met.";
          }
        }
        break;

      case "confirmPassword":
        if (!value.trim()) {
          error = "Please confirm your password.";
        } else if (value !== formData.password) {
          error = "Passwords do not match.";
        }
        break;

      default:
        break;
    }

    return error;
  };

  const validateFields = () => {
    const errors = {};
    Object.keys(formData).forEach((field) => {
      const error = validateField(field, formData[field]);
      if (error) errors[field] = error;
    });

    setFormErrors((prev) => ({ ...prev, ...errors }));
    return Object.keys(errors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    setFormErrors((prev) => ({
      ...prev,
      [name]: validateField(name, value),
    }));

    if (name === "password" && formData.confirmPassword) {
      setFormErrors((prev) => ({
        ...prev,
        confirmPassword:
          formData.confirmPassword !== value ? "Passwords do not match." : null,
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage("");

    if (!validateFields()) {
      return;
    }

    setIsSubmitting(true);

    try {
      await signUp({
        email: formData.email,
        password: formData.password,
        displayName: formData.email.split("@")[0],
      });
    } catch (err) {
      setErrorMessage(err.message || "Failed to create account");
    } finally {
      setIsSubmitting(false);
    }
  };

  const hasError = (fieldName) => !!formErrors[fieldName];

  return (
    <div className={authStyles.formContainer}>
      <div className={authStyles.header}>
        <h2 className={authStyles.title}>CREATE ACCOUNT</h2>
        <p className={authStyles.subtitle}>Register for archive access</p>
      </div>

      {errorMessage && (
        <div className={authStyles.authError}>{errorMessage}</div>
      )}

      <form className={authStyles.form} onSubmit={handleSubmit} noValidate>
        {/* Email Field */}
        <div className={formStyles.formGroup}>
          <label htmlFor="email" className={formStyles.formLabel}>
            <span className={terminalStyles.prompt}>$</span> EMAIL
          </label>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            className={`${formStyles.formInput} ${hasError("email") ? `${formStyles.formInput}` : ""}`}
            placeholder="your@email.com"
            value={formData.email}
            onChange={handleChange}
            disabled={isSubmitting}
            aria-describedby={hasError("email") ? "email-error" : undefined}
          />
          {hasError("email") && (
            <div id="email-error" className={formStyles.formError}>
              {formErrors.email}
            </div>
          )}
        </div>

        {/* Password Field */}
        <div className={formStyles.formGroup}>
          <label htmlFor="password" className={formStyles.formLabel}>
            <span className={terminalStyles.prompt}>$</span> PASSWORD
          </label>
          <input
            id="password"
            name="password"
            type="password"
            autoComplete="new-password"
            className={`${formStyles.formInput} ${hasError("password") ? `${formStyles.inputError}` : ""}`}
            placeholder="••••••••"
            value={formData.password}
            onChange={handleChange}
            disabled={isSubmitting}
            aria-describedby={
              hasError("password") ? "password-error" : undefined
            }
          />
          {hasError("password") && (
            <div id="password-error" className={formStyles.formError}>
              {formErrors.password}
            </div>
          )}
          {formErrors.passwordMinLength && (
            <div className={formStyles.formError}>
              {formErrors.passwordMinLength}
            </div>
          )}
          {formErrors.passwordNumber && (
            <div className={formStyles.formError}>
              {formErrors.passwordNumber}
            </div>
          )}
          {formErrors.passwordSpecialChar && (
            <div className={formStyles.formError}>
              {formErrors.passwordSpecialChar}
            </div>
          )}
          {formErrors.passwordUpperCase && (
            <div className={formStyles.formError}>
              {formErrors.passwordUpperCase}
            </div>
          )}
        </div>

        {/* Confirm Password Field */}
        <div className={formStyles.formGroup}>
          <label htmlFor="confirmPassword" className={formStyles.formLabel}>
            <span className={terminalStyles.prompt}>$</span> CONFIRM PASSWORD
          </label>
          <input
            id="confirmPassword"
            name="confirmPassword"
            type="password"
            autoComplete="new-password"
            className={`${formStyles.formInput} ${hasError("confirmPassword") ? `${formStyles.inputError}` : ""}`}
            placeholder="Re-enter password"
            value={formData.confirmPassword}
            onChange={handleChange}
            disabled={isSubmitting}
            aria-describedby={
              hasError("confirmPassword") ? "confirmPassword-error" : undefined
            }
          />
          {hasError("confirmPassword") && (
            <div id="confirmPassword-error" className={formStyles.formError}>
              {formErrors.confirmPassword}
            </div>
          )}
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          className={`${authStyles.authButton} ${authStyles.authSubmit}`}
          disabled={isSubmitting}
          data-testid="signup-button"
        >
          {isSubmitting ? (
            <>
              <span className={authStyles.authLoading}></span>REGISTERING...
            </>
          ) : (
            "CREATE ACCOUNT"
          )}
        </button>
      </form>

      <div className={authStyles.authFooter}>
        <p>
          Already have an account?{" "}
          <Link href="/login" className={authStyles.authLink}>
            Login here
          </Link>
        </p>
      </div>
    </div>
  );
}

export default SignupForm;
