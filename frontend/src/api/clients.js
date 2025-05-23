import API_URL from './config';

async function getAuthHeaders() {
  const token = sessionStorage.getItem('token') || localStorage.getItem('token');
  if (!token) {
    throw new Error('No authentication token found');
  }
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  };
}

export async function getAllClients(search = '') {
  const headers = await getAuthHeaders();
  const res = await fetch(`${API_URL}/api/clients/all?search=${encodeURIComponent(search)}`, {
    headers
  });
  if (!res.ok) throw new Error('Failed to fetch all clients');
  return await res.json();
}

export async function getClients(search = '') {
  const headers = await getAuthHeaders();
  const currentUser = JSON.parse(localStorage.getItem('user')) || JSON.parse(sessionStorage.getItem('user'));
  
  const accountantId = currentUser?.id;
  if (!accountantId) {
    throw new Error('You must be logged in to view clients');
  }
  const res = await fetch(`${API_URL}/api/clients?search=${encodeURIComponent(search)}&accountantId=${accountantId}`, {
    headers: await getAuthHeaders()
  });
  if (!res.ok) throw new Error('Failed to fetch clients');
  return await res.json();
}

export async function addClient({ name, email, password }) {
  const headers = await getAuthHeaders();
  const currentUser = JSON.parse(localStorage.getItem('user')) || JSON.parse(sessionStorage.getItem('user'));
  const accountantId = currentUser?.id;
    if (!accountantId) {
    throw new Error('You must be logged in to add a client');
  }

  const res = await fetch(`${API_URL}/api/clients`, {
    method: 'POST',
    headers: await getAuthHeaders(),
    body: JSON.stringify({ name, email, password, accountantId })
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Failed to add client');
  return data;
}

export async function acceptClient(id) {
  const res = await fetch(`${API_URL}/api/clients/${id}/accept`, {
    method: 'PATCH',
    headers: await getAuthHeaders()
  });
  if (!res.ok) throw new Error('Failed to accept client');
  return await res.json();
}

export async function rejectClient(id) {
  const res = await fetch(`${API_URL}/api/clients/${id}/reject`, {
    method: 'PATCH',
    headers: await getAuthHeaders()
  });
  if (!res.ok) throw new Error('Failed to reject client');
  return await res.json();
}

export async function deleteClient(id) {
  const res = await fetch(`${API_URL}/api/clients/${id}`, {
    method: 'DELETE',
    headers: await getAuthHeaders()
  });
  if (!res.ok) throw new Error('Failed to delete client');
  return await res.json();
}

export async function modifyClient(id, { name, email }) {
  const res = await fetch(`${API_URL}/api/clients/${id}`, {
    method: 'PUT',
    headers: await getAuthHeaders(),
    body: JSON.stringify({ name, email })
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Failed to modify client');
  return data;
}