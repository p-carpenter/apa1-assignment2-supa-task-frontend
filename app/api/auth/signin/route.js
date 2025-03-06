import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST(request) {
  try {
    const { email, password } = await request.json();
    
    // Call Supabase edge function
    const response = await fetch(`${process.env.SUPABASE_URL}/functions/v1/authentication/signin`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.SUPABASE_ANON_KEY}`,
      },
      body: JSON.stringify({ email, password }),
    });
    
    if (!response.ok) {
      const error = await response.json();
      return NextResponse.json(
        { error: error.error || 'Failed to sign in' },
        { status: response.status }
      );
    }
    
    // Get auth data from response
    const data = await response.json();
    
    // Set cookies from the edge function response
    if (data.session) {
      const cookieStore = await cookies(); // Use await with cookies() in Next.js 15
      
      cookieStore.set('sb-access-token', data.session.access_token, { 
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: 3600,
        path: '/',
        sameSite: 'lax'
      });
      
      cookieStore.set('sb-refresh-token', data.session.refresh_token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: 7776000, // 90 days
        path: '/',
        sameSite: 'lax'
      });
    }
    
    return NextResponse.json({ user: data.user, session: data.session });
  } catch (error) {
    console.error('Sign in error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
