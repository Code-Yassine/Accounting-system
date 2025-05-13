async function getAuthHeaders() {
  const token = sessionStorage.getItem('token');
  if (!token) {
    throw new Error('No authentication token found');
  }
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  };
}

// Get all documents (admin only)
export async function getAllDocuments(search = '') {
  const headers = await getAuthHeaders();
  const res = await fetch(`http://localhost:5000/api/documents/all?search=${encodeURIComponent(search)}`, {
    headers
  });
  if (!res.ok) throw new Error('Failed to fetch all documents');
  return await res.json();
}

// Get documents for current user (accountant/client)
export async function getDocuments(search = '') {
  const headers = await getAuthHeaders();
  const currentUser = JSON.parse(sessionStorage.getItem('user'));
  
  if (!currentUser?.id) {
    throw new Error('You must be logged in to view documents');
  }

  const res = await fetch(`http://localhost:5000/api/documents?search=${encodeURIComponent(search)}`, {
    headers
  });
  if (!res.ok) throw new Error('Failed to fetch documents');
  return await res.json();
}

// Add new document
export async function addDocument({ title, description, clientId, type }) {
  const headers = await getAuthHeaders();
  const currentUser = JSON.parse(sessionStorage.getItem('user'));
  
  if (!currentUser?.id) {
    throw new Error('You must be logged in to add a document');
  }

  const res = await fetch('http://localhost:5000/api/documents', {
    method: 'POST',
    headers,
    body: JSON.stringify({ 
      title, 
      description, 
      clientId,
      type,
      assignedAccountant: currentUser.id 
    })
  });
  
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Failed to add document');
  return data;
}

// Set document status to in progress
export async function setDocumentInProgress(id) {
  const headers = await getAuthHeaders();
  const res = await fetch(`http://localhost:5000/api/documents/${id}/in-progress`, {
    method: 'PATCH',
    headers
  });
  if (!res.ok) throw new Error('Failed to update document status');
  return await res.json();
}

// Set document status to processed
export async function setDocumentProcessed(id) {
  const headers = await getAuthHeaders();
  const res = await fetch(`http://localhost:5000/api/documents/${id}/processed`, {
    method: 'PATCH',
    headers
  });
  if (!res.ok) throw new Error('Failed to update document status');
  return await res.json();
}

// Reject document
export async function rejectDocument(id, reason) {
  const headers = await getAuthHeaders();
  const res = await fetch(`http://localhost:5000/api/documents/${id}/reject`, {
    method: 'PATCH',
    headers,
    body: JSON.stringify({ reason })
  });
  if (!res.ok) throw new Error('Failed to reject document');
  return await res.json();
}

// Delete document
export async function deleteDocument(id) {
  const headers = await getAuthHeaders();
  const res = await fetch(`http://localhost:5000/api/documents/${id}`, {
    method: 'DELETE',
    headers
  });
  if (!res.ok) throw new Error('Failed to delete document');
  return await res.json();
}

// Modify document
export async function modifyDocument(id, updates) {
  const headers = await getAuthHeaders();
  const res = await fetch(`http://localhost:5000/api/documents/${id}`, {
    method: 'PUT',
    headers,
    body: JSON.stringify(updates)
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Failed to modify document');
  return data;
}