import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function GET() {
  try {
    // Get tokens from cookies
    const cookieStore = await cookies();
    const accessToken = cookieStore.get('sb-access-token')?.value;
    const refreshToken = cookieStore.get('sb-refresh-token')?.value;
    
    if (!accessToken || !refreshToken) {
      return NextResponse.json(
        { user: null, session: null },
        { status: 401 }
      );
    }
    
    const response = await fetch(`${process.env.SUPABASE_URL}/functions/v1/authentication/user`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': `sb-access-token=${accessToken}; sb-refresh-token=${refreshToken}`,
        'Authorization': `Bearer ${process.env.SUPABASE_ANON_KEY}`,
      },
    });
    
    if (!response.ok) {
      if (response.status === 401) {
        return NextResponse.json({ user: null, session: null }, { status: 401 });
      }
      
      const error = await response.json();
      return NextResponse.json(
        { error: error.error || 'Failed to get user' },
        { status: response.status }
      );
    }
    
    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Get user error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
