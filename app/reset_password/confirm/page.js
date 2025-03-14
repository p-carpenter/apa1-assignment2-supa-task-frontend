"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/app/contexts/AuthContext";
import Link from "next/link";
import "../resetpassword.module.css";

// Import reusable components
import {
  ConsoleWindow,
  ConsoleSection,
  CommandOutput,
} from "../../components/ui";

export default function ConfirmResetPage() {
  const { isAuthenticated, loading } = useAuth();
  const router = useRouter();
  
  // State to store the token from hash
  const [token, setToken] = useState("");
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [formErrors, setFormErrors] = useState({});
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    // Extract token from URL hash if present
    if (typeof window !== "undefined") {
      // Check if we have an access_token in the hash
      const hash = window.location.hash;
      console.log("Hash:", hash);
      
      if (hash && hash.includes("access_token=")) {
        const extractedToken = hash.replace("#access_token=", "");
        console.log("Token found in hash:", extractedToken.substring(0, 10) + "...");
        setToken(extractedToken);
      } else {
        console.log("No token found in hash");
      }
    }
  }, []);

  useEffect(() => {
    // If user is already logged in, redirect to profile
    if (!loading && isAuthenticated) {
      router.push("/profile");
    }
    
    // If no token is present after check, redirect to the main reset password page
    if (typeof window !== "undefined" && !token && !window.location.hash.includes("access_token")) {
      console.log("No token found, redirecting to reset_password");
      router.push("/reset_password");
    }
  }, [isAuthenticated, loading, router, token]);

  // Validate a field
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
          const hasSpecialChar = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(value);
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

  // Validate all fields and return true if all are valid
  const validateFields = () => {
    const errors = {};

    // Validate email
    const emailError = validateField("email", formData.email);
    if (emailError) errors.email = emailError;

    // Validate password fields
    const passwordError = validateField("password", formData.password);
    if (passwordError) errors.password = passwordError;

    const confirmPasswordError = validateField("confirmPassword", formData.confirmPassword);
    if (confirmPasswordError) errors.confirmPassword = confirmPasswordError;

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
    setSuccessMessage("");

    // Validate all fields before submission
    if (!validateFields()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch("/api/auth/password-recovery/confirm", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ 
          email: formData.email, 
          password: formData.password,
          token 
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Something went wrong");
      }

      // Display success message
      setSuccessMessage("Your password has been successfully reset. You can now login with your new password.");
      
    } catch (err) {
      setErrorMessage(err.message || "Failed to process request");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Helper to determine if a field has an error
  const hasError = (fieldName) => {
    return !!formErrors[fieldName];
  };

  // Define status items for the console footer
  const statusItems = [
    "TECH INCIDENTS ARCHIVE",
    "PASSWORD RECOVERY",
    { text: "RESET PASSWORD", blink: true },
  ];

  // Show loading state while checking for token
  if (typeof window !== "undefined" && !token && window.location.hash.includes("access_token")) {
    return (
      <div className="loading-container">
        <div className="auth-loading"></div>
        <p>Loading password reset form...</p>
      </div>
    );
  }

  // If no token and no hash, return null (will redirect in useEffect)
  if (!token && typeof window !== "undefined" && !window.location.hash.includes("access_token")) {
    return null;
  }

  return (
    <>
      <div className="circuit-background"></div>

      <div className="auth-page-container">
        <ConsoleWindow
          title="tech-incidents-password-reset"
          statusItems={statusItems}
          className="auth-console"
        >
          <ConsoleSection
            command="security --recovery --reset"
            commandParts={{
              baseCommand: "security",
              flags: ["--recovery", "--reset"],
            }}
          >
            <CommandOutput
              title="PASSWORD RESET"
              showGlitch={true}
              showLoadingBar={true}
            >
              <div className="output-text">
                Create a new password for your account.
              </div>
              <div className="output-text highlight">
                ENTER NEW PASSWORD
              </div>
            </CommandOutput>

            <div className="auth-form-container">
              <div className="auth-header">
                <h2 className="auth-title">RESET PASSWORD</h2>
                <p className="auth-subtitle">
                  Create a new secure password
                </p>
              </div>

              {errorMessage && <div className="auth-error">{errorMessage}</div>}
              {successMessage && <div className="auth-success">{successMessage}</div>}

              {!successMessage && (
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
                      disabled={isSubmitting}
                    />
                    {formErrors.email && (
                      <div className="form-error">{formErrors.email}</div>
                    )}
                  </div>

                  <div className="form-group">
                    <label htmlFor="password" className="form-label">
                      <span className="prompt">$</span> NEW PASSWORD
                    </label>
                    <input
                      id="password"
                      name="password"
                      type="password"
                      autoComplete="new-password"
                      className={`form-input ${hasError("password") ? "input-error" : ""}`}
                      placeholder="••••••••"
                      value={formData.password}
                      onChange={handleChange}
                      disabled={isSubmitting}
                    />
                    {formErrors.password && (
                      <div className="form-error">{formErrors.password}</div>
                    )}
                    <p style={{ fontSize: "0.7rem", marginTop: "4px", color: "#888" }}>
                      Password must be at least 8 characters and include one number, one
                      special character, and one uppercase letter.
                    </p>
                  </div>

                  <div className="form-group">
                    <label htmlFor="confirmPassword" className="form-label">
                      <span className="prompt">$</span> CONFIRM PASSWORD
                    </label>
                    <input
                      id="confirmPassword"
                      name="confirmPassword"
                      type="password"
                      autoComplete="new-password"
                      className={`form-input ${
                        hasError("confirmPassword") ? "input-error" : ""
                      }`}
                      placeholder="••••••••"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      disabled={isSubmitting}
                    />
                    {formErrors.confirmPassword && (
                      <div className="form-error">{formErrors.confirmPassword}</div>
                    )}
                  </div>

                  <button
                    type="submit"
                    className="auth-button"
                    disabled={isSubmitting}
                    data-testid="confirm-reset-button"
                  >
                    {isSubmitting ? (
                      <>
                        <span className="auth-loading"></span>
                        PROCESSING...
                      </>
                    ) : (
                      "RESET PASSWORD"
                    )}
                  </button>
                </form>
              )}

              <div className="auth-footer">
                <p>
                  Remember your password?{" "}
                  <Link href="/login" className="auth-link">
                    Back to login
                  </Link>
                </p>
              </div>
            </div>
          </ConsoleSection>
        </ConsoleWindow>
      </div>
    </>
  );
}
