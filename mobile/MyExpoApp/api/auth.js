export async function signIn(email, password) {
  const res = await fetch('http://localhost:5000/api/mobile/signin', {
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