"use client";

import React, { useState } from "react";
import { useAuth } from "@/app/contexts/AuthContext";
import Link from "next/link";

function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { login, loading: authLoading } = useAuth();

  // Combine component's internal loading state with auth context loading state
  const loading = isSubmitting || authLoading;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    // Validate if fields are filled
    if (!email) {
      setError("Email is required");
      return;
    }

    if (!password) {
      setError("Password is required");
      return;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError("Invalid email address");
      return;
    }

    // Validate password (at least 8 characters with at least one number)
    if (password.length < 8) {
      setError("Password must be at least 8 characters long");
      return;
    }

    if (!/\d/.test(password)) {
      setError("Password must contain at least one number");
      return;
    }

    setIsSubmitting(true);

    try {
      await login({ email, password });
      // Redirect is handled by useEffect in the LoginPage component
    } catch (err) {
      setError(err.message || "Failed to sign in");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="auth-form-container">
      <div className="auth-header">
        <h2 className="auth-title">SYSTEM ACCESS</h2>
        <p className="auth-subtitle">Enter credentials to access archive</p>
      </div>

      {error && <div className="auth-error">{error}</div>}

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
            className="form-input"
            placeholder="user@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
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
            className="form-input"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={loading}
          />
          <p style={{ fontSize: "0.7rem", marginTop: "4px", color: "#888" }}>
            Password must be at least 8 characters long and contain at least one
            number
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
      </div>
    </div>
  );
}

export default LoginForm;
