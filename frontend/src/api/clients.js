export async function getAllClients(search = '') {
  const res = await fetch(`/api/clients/all?search=${encodeURIComponent(search)}`);
  if (!res.ok) throw new Error('Failed to fetch all clients');
  return await res.json();
}

export async function getClients(search = '') {
  // Get the current accountant's ID
  const currentUser = 
    JSON.parse(localStorage.getItem('user')) || 
    JSON.parse(localStorage.getItem('accountant')) || 
    JSON.parse(localStorage.getItem('userData')) ||
    JSON.parse(sessionStorage.getItem('user'));
  
  const accountantId = currentUser?._id || currentUser?.id || currentUser?.userId;
  
  if (!accountantId) {
    throw new Error('You must be logged in to view clients');
  }

  const res = await fetch(`/api/clients?search=${encodeURIComponent(search)}&accountantId=${accountantId}`);
  if (!res.ok) throw new Error('Failed to fetch clients');
  return await res.json();
}

export async function addClient({ name, email, password }) {
  // Try different localStorage keys where user data might be stored
  const currentUser = 
    JSON.parse(localStorage.getItem('user')) || 
    JSON.parse(localStorage.getItem('accountant')) || 
    JSON.parse(localStorage.getItem('userData')) ||
    JSON.parse(sessionStorage.getItem('user'));
  
  // Check if we have a valid user object with an ID
  const accountantId = currentUser?._id || currentUser?.id || currentUser?.userId;
  
  if (!accountantId) {
    throw new Error('You must be logged in to add a client');
  }

  const res = await fetch('/api/clients', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, email, password, accountantId })
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Failed to add client');
  return data;
}

export async function acceptClient(id) {
  const res = await fetch(`/api/clients/${id}/accept`, { method: 'PATCH' });
  if (!res.ok) throw new Error('Failed to accept client');
  return await res.json();
}

export async function rejectClient(id) {
  const res = await fetch(`/api/clients/${id}/reject`, { method: 'PATCH' });
  if (!res.ok) throw new Error('Failed to reject client');
  return await res.json();
}

export async function deleteClient(id) {
  const res = await fetch(`/api/clients/${id}`, { method: 'DELETE' });
  if (!res.ok) throw new Error('Failed to delete client');
  return await res.json();
}

export async function modifyClient(id, { name, email }) {
  const res = await fetch(`/api/clients/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, email })
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Failed to modify client');
  return data;
} 