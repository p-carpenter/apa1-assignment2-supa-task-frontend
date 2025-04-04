"use client";

import React, { useState } from "react";
import { useAuth } from "@/app/contexts/AuthContext";
import Link from "next/link";

function LoginForm() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [formErrors, setFormErrors] = useState({});
  const [errorMessage, setErrorMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { login, loading: authLoading } = useAuth();

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

  // Validate all fields and return true if all are valid
  const validateFields = () => {
    const errors = {};

    // Validate email
    const emailError = validateField("email", formData.email);
    if (emailError) errors.email = emailError;

    // Validate password
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

    // Validate all fields before submission
    if (!validateFields()) {
      return;
    }

    setIsSubmitting(true);

    try {
      await login({
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

  // Helper to determine if a field has an error
  const hasError = (fieldName) => {
    return !!formErrors[fieldName];
  };

  return (
    <div className="auth-form-container">
      <div className="auth-header">
        <h2 className="auth-title">SYSTEM ACCESS</h2>
        <p className="auth-subtitle">Enter credentials to access archive</p>
      </div>

      {errorMessage && <div className="auth-error">{errorMessage}</div>}

      <form className="auth-form" onSubmit={handleSubmit} noValidate>
        <div className="form-group">
          <label htmlFor="email" className="form-label">
            <span className="prompt">$</span> EMAIL
          </label>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            className={`form-input ${hasError("email") ? "input-error" : ""}`}
            placeholder="user@example.com"
            value={formData.email}
            onChange={handleChange}
            disabled={loading}
          />
          {formErrors.email && (
            <div className="form-error">{formErrors.email}</div>
          )}
        </div>

        <div className="form-group">
          <label htmlFor="password" className="form-label">
            <span className="prompt">$</span> PASSWORD
          </label>
          <input
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            className={`form-input ${hasError("password") ? "input-error" : ""}`}
            placeholder="••••••••"
            value={formData.password}
            onChange={handleChange}
            disabled={loading}
          />
          {formErrors.password && (
            <div className="form-error">{formErrors.password}</div>
          )}
          <p style={{ fontSize: "0.7rem", marginTop: "4px", color: "#888" }}>
            Password must be at least 8 characters and include one number, one
            special character, and one uppercase letter.
          </p>
        </div>

        <button
          type="submit"
          className="auth-button"
          disabled={loading}
          data-testid="login-button"
        >
          {loading ? (
            <>
              <span className="auth-loading"></span>
              AUTHENTICATING...
            </>
          ) : (
            "LOGIN"
          )}
        </button>
      </form>

      <div className="auth-footer">
        <p>
          Don't have access?{" "}
          <Link href="/signup" className="auth-link">
            Register account
          </Link>
        </p>
        <p>
          Forgot password?{" "}
          <Link href="/reset_password" className="auth-link">
            Reset password
          </Link>
        </p>
      </div>
    </div>
  );
}

export default LoginForm;
