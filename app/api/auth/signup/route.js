export async function POST(request) {
  try {
    const { email, password, displayName } = await request.json();
    
    const response = await fetch(`${process.env.SUPABASE_URL}/functions/v1/authentication/signup`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.SUPABASE_ANON_KEY}`,
      },
      body: JSON.stringify({ email, password, displayName }),
    });
    
    if (!response.ok) {
      const error = await response.json();
      return new Response(
        JSON.stringify({ error: error.error || 'Failed to sign up' }),
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
  } catch (error) {
    console.error('Sign up error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}
