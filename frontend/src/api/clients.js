export async function getClients(search = '') {
  const res = await fetch(`/api/clients?search=${encodeURIComponent(search)}`);
  if (!res.ok) throw new Error('Failed to fetch clients');
  return await res.json();
}

export async function addClient({ name, email, password }) {
  const res = await fetch('/api/clients', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, email, password })
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