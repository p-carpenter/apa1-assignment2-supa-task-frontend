'use server';

import { cookies } from 'next/headers';

const { SUPABASE_URL, SUPABASE_ANON_KEY } = process.env;
const EDGE_FUNCTION_URL = `${SUPABASE_URL}/functions/v1`;

/**
 * Get the current user from server component
 */
export async function getServerSession() {
  const cookieStore = cookies();
  const accessToken = await cookieStore.get('sb-access-token')?.value;
  const refreshToken = await cookieStore.get('sb-refresh-token')?.value;
  
  if (!accessToken || !refreshToken) {
    return { user: null, session: null };
  }
  
  try {
    const response = await fetch(`${EDGE_FUNCTION_URL}/authentication/user`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': `sb-access-token=${accessToken}; sb-refresh-token=${refreshToken}`,
        Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
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
  const cookieStore = cookies();
  const accessToken = await cookieStore.get('sb-access-token')?.value;
  const refreshToken = await cookieStore.get('sb-refresh-token')?.value;
  
  if (!accessToken || !refreshToken) {
    return null;
  }
  
  try {
    const response = await fetch(`${EDGE_FUNCTION_URL}/validate-auth`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': `sb-access-token=${accessToken}; sb-refresh-token=${refreshToken}`,
        Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
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
