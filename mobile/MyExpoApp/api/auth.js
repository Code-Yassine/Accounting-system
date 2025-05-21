export async function signIn(email, password) {
  const res = await fetch('http://192.168.0.105:5000/api/mobile/signin', {
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
    const res = await fetch('http://192.168.0.105:5000/api/mobile/health', {
      method: 'GET'
    });
    return res.ok;
  } catch (error) {
    return false;
  }
}