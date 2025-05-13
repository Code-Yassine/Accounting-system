export async function signIn(email, password) {
  try {
    const res = await fetch('http://localhost:5000/api/auth/signin', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });

    let data;
    try {
      data = await res.json();
    } catch (jsonErr) {
      throw new Error('Server error or invalid response');
    }

    if (!res.ok) {
      // Handle specific error messages from the server
      throw new Error(data.message || 'Sign in failed');
    }

    // Verify we have both token and user data
    if (!data.token || !data.user) {
      throw new Error('Invalid response format from server');
    }

    return data;
  } catch (error) {
    if (error.name === 'TypeError') {
      throw new Error('Cannot connect to backend. Is the server running?');
    }
    throw error;
  }
}