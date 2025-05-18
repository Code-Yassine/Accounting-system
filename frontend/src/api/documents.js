// Get all documents
export async function getAllDocuments(search = '') {
    const res = await fetch(`http://localhost:5000/api/documents/all?search=${encodeURIComponent(search)}`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });
    if (!res.ok) throw new Error('Failed to fetch all documents');
    return await res.json();
  }
  
  // Get documents for current user
  export async function getDocuments(search = '', clientId) {
    if (!clientId) {
      throw new Error('Client ID is required');
    }
  
    const res = await fetch(`http://localhost:5000/api/documents?search=${encodeURIComponent(search)}&clientId=${clientId}`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });
    if (!res.ok) throw new Error('Failed to fetch documents');
    return await res.json();
  }
  
  // Add new document
  export async function addDocument(documentData, clientId) {
    if (!clientId) {
      throw new Error('Client ID is required');
    }
  
    const res = await fetch('http://localhost:5000/api/documents', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify({
        ...documentData,
        client: clientId
      })
    });
    
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to add document');
    return data;
  }
  
  // Set document status to in progress
  export async function setDocumentInProgress(id) {
    const res = await fetch(`http://localhost:5000/api/documents/${id}/in-progress`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });
    if (!res.ok) throw new Error('Failed to update document status');
    return await res.json();
  }
  
  // Set document status to processed
  export async function setDocumentProcessed(id) {
    const res = await fetch(`http://localhost:5000/api/documents/${id}/processed`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });
    if (!res.ok) throw new Error('Failed to update document status');
    return await res.json();
  }
  
  // Reject document
  export async function rejectDocument(id, reason) {
    const res = await fetch(`http://localhost:5000/api/documents/${id}/reject`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify({ reason })
    });
    if (!res.ok) throw new Error('Failed to reject document');
    return await res.json();
  }
  
  // Delete document
  export async function deleteDocument(id) {
    const res = await fetch(`http://localhost:5000/api/documents/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });
    if (!res.ok) throw new Error('Failed to delete document');
    return await res.json();
  }
  
  // Modify document
  export async function modifyDocument(id, updates) {
    const res = await fetch(`http://localhost:5000/api/documents/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify(updateData)
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to modify document');
    return data;
  }