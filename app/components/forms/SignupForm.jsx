"use client";

import React, { useState } from "react";
import { useAuth } from "@/app/contexts/AuthContext";
import authStyles from "./Auth.module.css";
import {
  TextField,
  PasswordField,
  FormErrorMessage,
  FormFooterLinks,
  FormButtons,
  PromptLabel
} from "./fields";

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

  // Password requirements to display as helper text
  const passwordRequirementsHtml = () => {
    return (
      <>
        {formErrors.passwordMinLength && <div className="formStyles.formError">{formErrors.passwordMinLength}</div>}
        {formErrors.passwordNumber && <div className="formStyles.formError">{formErrors.passwordNumber}</div>}
        {formErrors.passwordSpecialChar && <div className="formStyles.formError">{formErrors.passwordSpecialChar}</div>}
        {formErrors.passwordUpperCase && <div className="formStyles.formError">{formErrors.passwordUpperCase}</div>}
      </>
    );
  };

  return (
    <div className={authStyles.formContainer}>
      <div className={authStyles.header}>
        <h2 className={authStyles.title}>CREATE ACCOUNT</h2>
        <p className={authStyles.subtitle}>Register for archive access</p>
      </div>

      <FormErrorMessage message={errorMessage} useAuthStyle={true} />

      <form className={authStyles.form} onSubmit={handleSubmit} noValidate>
        <TextField
          id="email"
          name="email"
          type="email"
          label={<PromptLabel>EMAIL</PromptLabel>}
          autoComplete="email"
          value={formData.email}
          onChange={handleChange}
          placeholder="your@email.com"
          disabled={isSubmitting}
          error={formErrors.email}
        />

        <PasswordField
          id="password"
          name="password"
          label={<PromptLabel>PASSWORD</PromptLabel>}
          autoComplete="new-password"
          value={formData.password}
          onChange={handleChange}
          disabled={isSubmitting}
          error={formErrors.password}
        />
        
        {/* Display password requirements */}
        {passwordRequirementsHtml()}

        <PasswordField
          id="confirmPassword"
          name="confirmPassword"
          label={<PromptLabel>CONFIRM PASSWORD</PromptLabel>}
          autoComplete="new-password"
          value={formData.confirmPassword}
          onChange={handleChange}
          placeholder="Re-enter password"
          disabled={isSubmitting}
          error={formErrors.confirmPassword}
        />

        <FormButtons
          submitLabel="CREATE ACCOUNT"
          loadingLabel="REGISTERING..."
          useAuthStyle={true}
          testId="signup-button"
          isSubmitting={isSubmitting}
        />
      </form>

      <FormFooterLinks
        links={[
          {
            label: "Already have an account?",
            href: "/login",
            text: "Login here"
          }
        ]}
      />
    </div>
  );
}

export default SignupForm;