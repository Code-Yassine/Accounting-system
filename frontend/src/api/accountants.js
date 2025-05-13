export async function getAccountants(search = '') {
  const token = sessionStorage.getItem('token');
  if (!token) {
    throw new Error('Authentication required');
  }

  const res = await fetch(`/api/accountants?search=${encodeURIComponent(search)}`, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });

  if (res.status === 401) {
    sessionStorage.removeItem('token');
    throw new Error('Session expired. Please sign in again.');
  }

  if (!res.ok) throw new Error('Failed to fetch accountants');
  return await res.json();
}

export async function addAccountant({ name, email, password }) {
  const token = sessionStorage.getItem('token');
  if (!token) {
    throw new Error('Authentication required');
  }

  const res = await fetch('/api/accountants', {
    method: 'POST',
    headers: { 
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({ name, email, password })
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Failed to add accountant');
  return data;
}

export async function modifyAccountant(id, data) {
  const token = sessionStorage.getItem('token');
  if (!token) {
    throw new Error('Authentication required');
  }

  const res = await fetch(`/api/accountants/${id}`, {
    method: 'PATCH',
    headers: { 
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(data)
  });

  if (res.status === 401) {
    sessionStorage.removeItem('token');
    throw new Error('Session expired. Please sign in again.');
  }

  const responseData = await res.json();
  if (!res.ok) throw new Error(responseData.message || 'Failed to modify accountant');
  return responseData;
}

export async function activateAccountant(id) {
  const token = sessionStorage.getItem('token');
  if (!token) {
    throw new Error('Authentication required');
  }

  const res = await fetch(`/api/accountants/${id}/activate`, { 
    method: 'PATCH',
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });

  if (res.status === 401) {
    sessionStorage.removeItem('token');
    throw new Error('Session expired. Please sign in again.');
  }

  if (!res.ok) throw new Error('Failed to activate accountant');
  return await res.json();
}

export async function deactivateAccountant(id) {
  const token = sessionStorage.getItem('token');
  if (!token) {
    throw new Error('Authentication required');
  }

  const res = await fetch(`/api/accountants/${id}/deactivate`, { 
    method: 'PATCH',
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });

  if (res.status === 401) {
    sessionStorage.removeItem('token');
    throw new Error('Session expired. Please sign in again.');
  }

  if (!res.ok) throw new Error('Failed to deactivate accountant');
  return await res.json();
}

export async function deleteAccountant(id) {
  const token = sessionStorage.getItem('token');
  if (!token) {
    throw new Error('Authentication required');
  }

  const res = await fetch(`/api/accountants/${id}`, { 
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });

  if (res.status === 401) {
    sessionStorage.removeItem('token');
    throw new Error('Session expired. Please sign in again.');
  }

  if (!res.ok) throw new Error('Failed to delete accountant');
  return await res.json();
}