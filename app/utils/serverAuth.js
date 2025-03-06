'use server';

import { cookies } from 'next/headers';

/**
 * Get the current user from server component
 */
export async function getServerSession() {
  const cookieStore = await cookies(); // Use await with cookies() in Next.js 15
  const accessToken = cookieStore.get('sb-access-token')?.value;
  const refreshToken = cookieStore.get('sb-refresh-token')?.value;
  
  if (!accessToken || !refreshToken) {
    return { user: null, session: null };
  }
  
  try {
    const response = await fetch(`${process.env.SUPABASE_URL}/functions/v1/authentication/user`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': `sb-access-token=${accessToken}; sb-refresh-token=${refreshToken}`,
        'Authorization': `Bearer ${process.env.SUPABASE_ANON_KEY}`,
      },
    });
    
    if (!response.ok) {
      return { user: null, session: null };
    }
    
    return await response.json();
  } catch (error) {
    console.error('Server auth error:', error);
    return { user: null, session: null };
  }
}

/**
 * Fetch protected data from server component
 */
export async function getProtectedData() {
  const cookieStore = await cookies(); // Use await with cookies() in Next.js 15
  const accessToken = cookieStore.get('sb-access-token')?.value;
  const refreshToken = cookieStore.get('sb-refresh-token')?.value;
  
  if (!accessToken || !refreshToken) {
    return null;
  }
  
  try {
    const response = await fetch(`${process.env.SUPABASE_URL}/functions/v1/validate-auth`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': `sb-access-token=${accessToken}; sb-refresh-token=${refreshToken}`,
        'Authorization': `Bearer ${process.env.SUPABASE_ANON_KEY}`,
      },
    });
    
    if (!response.ok) {
      return null;
    }
    
    return await response.json();
  } catch (error) {
    console.error('Protected data error:', error);
    return null;
  }
}
