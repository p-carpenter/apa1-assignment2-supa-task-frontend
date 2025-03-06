'use client';

import { createContext, useContext, useState, useEffect } from 'react';
import { signIn, signUp, signOut, getCurrentUser } from '../utils/auth/authUtils';

// Create Auth Context
const AuthContext = createContext();

// Auth Provider component
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  // Load user on initial render
  useEffect(() => {
    async function loadUser() {
      try {
        setLoading(true);
        const { user, session } = await getCurrentUser();
        setUser(user);
        setSession(session);
      } catch (error) {
        console.error('Error loading user:', error);
      } finally {
        setLoading(false);
      }
    }

    loadUser();
  }, []);

  // Auth methods
  const login = async (credentials) => {
    try {
      const { user, session } = await signIn(credentials);
      setUser(user);
      setSession(session);
      return { user, session };
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  const register = async (credentials) => {
    try {
      const { user, session } = await signUp(credentials);
      setUser(user);
      setSession(session);
      return { user, session };
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await signOut();
      setUser(null);
      setSession(null);
    } catch (error) {
      console.error('Logout error:', error);
      throw error;
    }
  };

  // Auth context value
  const value = {
    user,
    session,
    loading,
    login,
    register,
    logout,
    isAuthenticated: !!user,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

// Auth hook for components
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
