export async function getAccountants(search = '') {
  const res = await fetch(`/api/accountants?search=${encodeURIComponent(search)}`);
  if (!res.ok) throw new Error('Failed to fetch accountants');
  return await res.json();
}

export async function addAccountant({ name, email, password }) {
  const res = await fetch('/api/accountants', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, email, password })
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Failed to add accountant');
  return data;
}

export async function activateAccountant(id) {
  const res = await fetch(`/api/accountants/${id}/activate`, { method: 'PATCH' });
  if (!res.ok) throw new Error('Failed to activate accountant');
  return await res.json();
}

export async function deactivateAccountant(id) {
  const res = await fetch(`/api/accountants/${id}/deactivate`, { method: 'PATCH' });
  if (!res.ok) throw new Error('Failed to deactivate accountant');
  return await res.json();
}

export async function deleteAccountant(id) {
  const res = await fetch(`/api/accountants/${id}`, { method: 'DELETE' });
  if (!res.ok) throw new Error('Failed to delete accountant');
  return await res.json();
} 