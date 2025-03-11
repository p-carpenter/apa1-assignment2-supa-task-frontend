'use client';

const { SUPABASE_ANON_KEY } = process.env;
/**
 * Sign in a user with email and password
 */
export async function signIn({ email, password }) {
  try {
    const response = await fetch('/api/auth/signin', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
      },
      credentials: 'include', // Important for cookies
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to sign in');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Sign in error:', error);
    throw error;
  }
}

/**
 * Sign up a new user with email and password
 */
export async function signUp({ email, password, displayName }) {
  try {
    const response = await fetch('/api/auth/signup', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
      },
      body: JSON.stringify({ email, password, displayName }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to sign up');
    }

    return await response.json();
  } catch (error) {
    console.error('Sign up error:', error);
    throw error;
  }
}

/**
 * Sign out the current user
 */
export async function signOut() {
  try {
    const response = await fetch('/api/auth/signout', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
      },
      credentials: 'include', // Important for cookies
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to sign out');
    }

    return await response.json();
  } catch (error) {
    console.error('Sign out error:', error);
    throw error;
  }
}

/**
 * Get the current user
 */
export async function getCurrentUser() {
  try {
    const response = await fetch('/api/auth/user', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
      },
      credentials: 'include', // Important for cookies
    });

    if (!response.ok) {
      if (response.status === 401) {
        return { user: null, session: null };
      }
      const error = await response.json();
      throw new Error(error.error || 'Failed to get user');
    }

    return await response.json();
  } catch (error) {
    console.error('Get user error:', error);
    return { user: null, session: null };
  }
}

/**
 * Fetch protected user data
 */
export async function getProtectedData() {
  try {
    const response = await fetch('/api/auth/protected', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
      },
      credentials: 'include', // Important for cookies
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to fetch protected data');
    }

    return await response.json();
  } catch (error) {
    console.error('Protected data error:', error);
    return null;
  }
}

/**
 * Send data to protected endpoint
 */
export async function addProtectedData(data) {
  try {
    const response = await fetch('/api/auth/protected', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
      },
      credentials: 'include', // Important for cookies
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to add data');
    }

    return await response.json();
  } catch (error) {
    console.error('Add protected data error:', error);
    throw error;
  }
}
