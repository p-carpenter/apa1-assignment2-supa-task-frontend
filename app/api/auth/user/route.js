import { cookies } from 'next/headers';

export async function GET() {
  try {
    // Get tokens from cookies
    const cookieStore = cookies();
    const accessToken = cookieStore.get('sb-access-token')?.value;
    const refreshToken = cookieStore.get('sb-refresh-token')?.value;
    
    if (!accessToken || !refreshToken) {
      return new Response(
        JSON.stringify({ user: null, session: null }),
        { 
          status: 401,
          headers: { 'Content-Type': 'application/json' }
        }
      );
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
        if (response.status === 401) {
          return new Response(
            JSON.stringify({ user: null, session: null }),
            { 
              status: 401,
              headers: { 'Content-Type': 'application/json' }
            }
          );
        }
        
        const error = await response.json();
        return new Response(
          JSON.stringify({ error: error.error || 'Failed to get user' }),
          { 
            status: response.status,
            headers: { 'Content-Type': 'application/json' }
          }
        );
      }
      
      const data = await response.json();
      return new Response(
        JSON.stringify(data),
        { 
          status: 200,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    } catch (fetchError) {
      // Network errors specifically go here
      console.error('Network error:', fetchError);
      return new Response(
        JSON.stringify({ error: 'Internal server error' }),
        { 
          status: 500,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }
  } catch (error) {
    // General errors go here
    console.error('Get user error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}
