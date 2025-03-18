"use client";

import React, { useState } from "react";
import { useAuth } from "@/app/contexts/AuthContext";
import Link from "next/link";
import authStyles from "./Auth.module.css";
import formStyles from "./FormStyles.module.css";
import terminalStyles from "@/app/components/ui/console/Terminal.module.css";

function LoginForm() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [formErrors, setFormErrors] = useState({});
  const [errorMessage, setErrorMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { signIn, loading: authLoading } = useAuth();

  // Combine component's internal loading state with auth context loading state
  const loading = isSubmitting || authLoading;

  // Validate a single field
  const validateField = (name, value) => {
    let error = null;

    switch (name) {
      case "email":
        if (!value.trim()) {
          error = "Email is required.";
        } else {
          // Email format validation
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          if (!emailRegex.test(value)) {
            error = "Please enter a valid email address.";
          }
        }
        break;

      case "password":
        if (!value.trim()) {
          error = "Password is required.";
        } else if (value.length < 8) {
          error = "Password must be at least 8 characters long.";
        } else {
          // Check for password requirements
          const hasNumber = /[0-9]/.test(value);
          const hasSpecialChar = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(
            value
          );
          const hasUpperCase = /[A-Z]/.test(value);

          if (!hasNumber) {
            error = "Password must contain at least one number.";
          } else if (!hasSpecialChar) {
            error = "Password must contain at least one special character.";
          } else if (!hasUpperCase) {
            error = "Password must contain at least one uppercase letter.";
          }
        }
        break;

      default:
        break;
    }

    return error;
  };

  const validateFields = () => {
    const errors = {};

    const emailError = validateField("email", formData.email);
    if (emailError) errors.email = emailError;

    const passwordError = validateField("password", formData.password);
    if (passwordError) errors.password = passwordError;

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Validate field as user types and update errors
    const error = validateField(name, value);
    setFormErrors((prev) => ({
      ...prev,
      [name]: error,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage("");

    if (!validateFields()) {
      return;
    }

    setIsSubmitting(true);

    try {
      await signIn({
        email: formData.email,
        password: formData.password,
      });
      // Redirect is handled by useEffect in the LoginPage component
    } catch (err) {
      setErrorMessage(err.message || "Failed to sign in");
    } finally {
      setIsSubmitting(false);
    }
  };

  const hasError = (fieldName) => {
    return !!formErrors[fieldName];
  };

  return (
    <div className={authStyles.formContainer}>
      <div className={authStyles.header}>
        <h2 className={authStyles.title}>SYSTEM ACCESS</h2>
        <p className={authStyles.subtitle}>
          Enter credentials to access archive
        </p>
      </div>

      {errorMessage && (
        <div className={authStyles.authError}>{errorMessage}</div>
      )}

      <form className={authStyles.form} onSubmit={handleSubmit} noValidate>
        <div className={formStyles.formGroup}>
          <label htmlFor="email" className={formStyles.formLabel}>
            <span className={terminalStyles.prompt}>$</span> EMAIL
          </label>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            className={`${formStyles.formInput} ${hasError("email") ? `${formStyles.inputError}` : ""}`}
            placeholder="user@example.com"
            value={formData.email}
            onChange={handleChange}
            disabled={loading}
          />
          {formErrors.email && (
            <div className={formStyles.formError}>{formErrors.email}</div>
          )}
        </div>

        <div className={formStyles.formGroup}>
          <label htmlFor="password" className={formStyles.formLabel}>
            <span className={terminalStyles.prompt}>$</span> PASSWORD
          </label>
          <input
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            className={`${formStyles.formInput} ${hasError("password") ? `${formStyles.inputError}` : ""}`}
            placeholder="••••••••"
            value={formData.password}
            onChange={handleChange}
            disabled={loading}
          />
          {formErrors.password && (
            <div className={formStyles.formError}>{formErrors.password}</div>
          )}
          <p style={{ fontSize: "0.7rem", marginTop: "4px", color: "#888" }}>
            Password must be at least 8 characters and include one number, one
            special character, and one uppercase letter.
          </p>
        </div>

        <button
          type="submit"
          className={`${authStyles.authButton} ${authStyles.authSubmit}`}
          data-testid="login-button"
        >
          {loading ? (
            <>
              <span className={authStyles.authLoading}></span>
              AUTHENTICATING...
            </>
          ) : (
            "LOGIN"
          )}
        </button>
      </form>

      <div className={authStyles.authFooter}>
        <p>
          Don't have access?{" "}
          <Link href="/signup" className={authStyles.authLink}>
            Register account
          </Link>
        </p>
        <p>
          Forgot password?{" "}
          <Link href="/reset_password" className={authStyles.authLink}>
            Reset password
          </Link>
        </p>
      </div>
    </div>
  );
}

export default LoginForm;
