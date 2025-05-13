const API_URL = '/api/deleteRequests';

export async function addDeleteRequest({ clientId }) {
  const token = sessionStorage.getItem('token');
  if (!token) {
    throw new Error('Authentication required');
  }

  const currentUser = JSON.parse(sessionStorage.getItem('user'));
  const accountantId = currentUser?._id || currentUser?.id;
  
  if (!accountantId) {
    throw new Error('You must be logged in to add a delete request');
  }

  const res = await fetch(API_URL, {
    method: 'POST',
    headers: { 
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({ clientId, accountantId })
  });
  if (!res.ok) throw new Error('Failed to add delete request');
  return await res.json();
}

export async function getDeleteRequests() {
  const token = sessionStorage.getItem('token');
  if (!token) {
    throw new Error('Authentication required');
  }

  const res = await fetch(API_URL, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  if (!res.ok) throw new Error('Failed to fetch delete requests');
  return await res.json();
}

export async function approveDeleteRequest(id) {
  const token = sessionStorage.getItem('token');
  if (!token) {
    throw new Error('Authentication required');
  }

  const res = await fetch(`${API_URL}/${id}`, {
    method: 'PATCH',
    headers: { 
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({ status: 'approved' })
  });
  if (!res.ok) throw new Error('Failed to approve delete request');
  return await res.json();
}

export async function rejectDeleteRequest(id) {
  const token = sessionStorage.getItem('token');
  if (!token) {
    throw new Error('Authentication required');
  }

  const res = await fetch(`${API_URL}/${id}`, {
    method: 'PATCH',
    headers: { 
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({ status: 'rejected' })
  });
  if (!res.ok) throw new Error('Failed to reject delete request');
  return await res.json();
}
