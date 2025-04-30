const API_URL = '/api/deleteRequests';

export async function addDeleteRequest({ clientId }) {
  // Try different localStorage keys where user data might be stored
  const currentUser = 
    JSON.parse(localStorage.getItem('user')) || 
    JSON.parse(localStorage.getItem('accountant')) || 
    JSON.parse(localStorage.getItem('userData')) ||
    JSON.parse(sessionStorage.getItem('user'));
  
  // Check if we have a valid user object with an ID
  const accountantId = currentUser?._id || currentUser?.id || currentUser?.userId;
  
  if (!accountantId) {
    throw new Error('You must be logged in to add a delete request');
  }

  const res = await fetch(API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ clientId, accountantId })
  });
  if (!res.ok) throw new Error('Failed to add delete request');
  return await res.json();
}

export async function getDeleteRequests() {
  const res = await fetch(API_URL);
  if (!res.ok) throw new Error('Failed to fetch delete requests');
  return await res.json();
}

export async function approveDeleteRequest(id) {
  const res = await fetch(`${API_URL}/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status: 'approved' })
  });
  if (!res.ok) throw new Error('Failed to approve delete request');
  return await res.json();
}

export async function rejectDeleteRequest(id) {
  const res = await fetch(`${API_URL}/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status: 'rejected' })
  });
  if (!res.ok) throw new Error('Failed to reject delete request');
  return await res.json();
}
