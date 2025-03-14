"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/app/contexts/AuthContext";
import Link from "next/link";
import "./resetpassword.module.css";

import { ConsoleWindow, ConsoleSection, CommandOutput } from "../components/ui";

export default function ResetPasswordPage() {
  const { isAuthenticated, loading } = useAuth();
  const router = useRouter();

  const [formData, setFormData] = useState({
    email: "",
  });
  const [formErrors, setFormErrors] = useState({});
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!loading && isAuthenticated) {
      router.push("/profile");
    }
  }, [isAuthenticated, loading, router]);

  const validateEmail = (email) => {
    if (!email.trim()) {
      return "Email is required.";
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return "Please enter a valid email address.";
    }

    return null;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (name === "email") {
      const error = validateEmail(value);
      setFormErrors((prev) => ({
        ...prev,
        email: error,
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");

    const emailError = validateEmail(formData.email);
    if (emailError) {
      setFormErrors({ email: emailError });
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch("/api/auth/password-recovery", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email: formData.email }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Something went wrong");
      }

      setSuccessMessage(
        "Password reset instructions have been sent to your email."
      );

      setFormData({ email: "" });
    } catch (err) {
      setErrorMessage(err.message || "Failed to process request");
    } finally {
      setIsSubmitting(false);
    }
  };

  const hasError = (fieldName) => {
    return !!formErrors[fieldName];
  };

  const statusItems = [
    "TECH INCIDENTS ARCHIVE",
    "PASSWORD RECOVERY",
    { text: "REQUEST RESET", blink: true },
  ];

  return (
    <>
      <div className="circuit-background"></div>

      <div className="auth-page-container">
        <ConsoleWindow
          title="tech-incidents-password-recovery"
          statusItems={statusItems}
          className="auth-console"
        >
          <ConsoleSection
            command="security --recovery --request"
            commandParts={{
              baseCommand: "security",
              flags: ["--recovery", "--request"],
            }}
          >
            <CommandOutput
              title="PASSWORD RECOVERY"
              showGlitch={true}
              showLoadingBar={true}
            >
              <div className="output-text">
                Request a password reset link to be sent to your email.
              </div>
              <div className="output-text highlight">
                ENTER YOUR EMAIL ADDRESS
              </div>
            </CommandOutput>

            <div className="auth-form-container">
              <div className="auth-header">
                <h2 className="auth-title">RECOVER ACCESS</h2>
                <p className="auth-subtitle">
                  We'll send you password reset instructions to your email.
                </p>
              </div>

              {errorMessage && <div className="auth-error">{errorMessage}</div>}
              {successMessage && (
                <div className="auth-success">{successMessage}</div>
              )}

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

                  <button
                    type="submit"
                    className="auth-button"
                    disabled={isSubmitting}
                    data-testid="reset-password-button"
                  >
                    {isSubmitting ? (
                      <>
                        <span className="auth-loading"></span>
                        PROCESSING...
                      </>
                    ) : (
                      "SEND RESET LINK"
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
