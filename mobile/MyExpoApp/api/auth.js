import API_URL from './config';

export async function signIn(email, password) {
  const res = await fetch(`${API_URL}/api/mobile/signin`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });
  let data;
  try {
    data = await res.json();
  } catch (jsonErr) {
    throw new Error('Server error or invalid response.');
  }
  if (!res.ok) throw new Error(data.message || 'Sign in failed');
  return data;
}

export async function testConnection() {
  try {
    const res = await fetch(`${API_URL}/api/mobile/health`, {
      method: 'GET'
    });
    return res.ok;
  } catch (error) {
    return false;
  }
}