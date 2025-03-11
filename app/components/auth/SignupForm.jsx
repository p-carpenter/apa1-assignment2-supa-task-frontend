'use client';

import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import Link from 'next/link';

function SignupForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { register } = useAuth();
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('Please enter a valid email address');
      return;
    }
    
    // Validate input
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    
    if (password.length < 8) {
      setError('Password must be at least 8 characters long');
      return;
    }
    
    if (!/\d/.test(password)) {
      setError('Password must contain at least one number');
      return;
    }
    
    setLoading(true);
    
    try {
      // Use email as displayName since we removed the username field
      await register({ email, password, displayName: email.split('@')[0] });
      // Redirect is handled by useEffect in the SignupPage component
    } catch (err) {
      setError(err.message || 'Failed to create account');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="auth-form-container">
      <div className="auth-header">
        <h2 className="auth-title">CREATE ACCOUNT</h2>
        <p className="auth-subtitle">Register for archive access</p>
      </div>
      
      {error && (
        <div className="auth-error">
          {error}
        </div>
      )}
      
      <form className="auth-form" onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="email-address" className="form-label">
            <span className="prompt">$</span> EMAIL
          </label>
          <input
            id="email-address"
            name="email"
            type="email"
            autoComplete="email"
            required
            className="form-input"
            placeholder="your@email.com"
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
            autoComplete="new-password"
            required
            className="form-input"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <p style={{ fontSize: '0.7rem', marginTop: '4px', color: '#888' }}>
            Password must be at least 8 characters long and contain at least one number
          </p>
        </div>
        
        <div className="form-group">
          <label htmlFor="confirm-password" className="form-label">
            <span className="prompt">$</span> CONFIRM PASSWORD
          </label>
          <input
            id="confirm-password"
            name="confirmPassword"
            type="password"
            autoComplete="new-password"
            required
            className="form-input"
            placeholder="Re-enter password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />
        </div>
        
        <button
          type="submit"
          className="auth-button"
          disabled={loading}
        >
          {loading ? (
            <>
              <span className="auth-loading"></span>
              REGISTERING...
            </>
          ) : (
            'CREATE ACCOUNT'
          )}
        </button>
      </form>
      
      <div className="auth-footer">
        <p>
          Already have an account? <Link href="/login" className="auth-link">Login here</Link>
        </p>
      </div>
    </div>
  );
}

export default SignupForm;
