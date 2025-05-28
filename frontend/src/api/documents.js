import API_URL from './config';

// Get token from storage
const getStoredToken = () => {
    return localStorage.getItem('token') || sessionStorage.getItem('token');
};

// Get documents for current accountant
export async function getMyDocuments(search = '') {
    const token = getStoredToken();
    console.log('Auth token present:', !!token); // Will log true/false without exposing the token
    if (!token) {
        throw new Error('Authentication required');
    }

    const response = await fetch(`${API_URL}/api/documents/accountant?search=${encodeURIComponent(search)}`, {
        headers: {
            'Authorization': `Bearer ${token}`
        }
    });
    
    if (response.status === 401) {
        localStorage.removeItem('token');
        sessionStorage.removeItem('token');
        throw new Error('Session expired. Please sign in again.');
    }
      if (!response.ok) {
        const errorData = await response.json();
        console.error('API Error:', {
            status: response.status,
            statusText: response.statusText,
            error: errorData
        });
        throw new Error(errorData.message || 'Failed to fetch accountant documents');
    }
    
    const data = await response.json();
    console.log('API Response:', {
        documentsCount: data.length,
        firstDocument: data[0] // Log first document as sample
    });
    return data;
}

// Add new document
export async function addDocument(documentData, clientId) {
    const token = getStoredToken();
    if (!token) {
        throw new Error('Authentication required');
    }
    if (!clientId) {
        throw new Error('Client ID is required');
    }

    const response = await fetch(`${API_URL}/api/documents`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
            ...documentData,
            client: clientId
        })
    });
    
    const data = await response.json();
    if (response.status === 401) {
        localStorage.removeItem('token');
        sessionStorage.removeItem('token');
        throw new Error('Session expired. Please sign in again.');
    }
    if (!response.ok) throw new Error(data.message || 'Failed to add document');
    return data;
}

// Set document status to processed
export async function setDocumentProcessed(id) {
    const token = getStoredToken();
    if (!token) {
        throw new Error('Authentication required');
    }

    const response = await fetch(`${API_URL}/api/documents/${id}/processed`, {
        method: 'PATCH',
        headers: {
            'Authorization': `Bearer ${token}`
        }
    });
    if (response.status === 401) {
        localStorage.removeItem('token');
        sessionStorage.removeItem('token');
        throw new Error('Session expired. Please sign in again.');
    }
    if (!response.ok) throw new Error('Failed to update document status');
    return await response.json();
}

// Reject document
export async function rejectDocument(id, reason) {
    const token = getStoredToken();
    if (!token) {
        throw new Error('Authentication required');
    }

    const response = await fetch(`${API_URL}/api/documents/${id}/reject`, {
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ reason })
    });
    if (response.status === 401) {
        localStorage.removeItem('token');
        sessionStorage.removeItem('token');
        throw new Error('Session expired. Please sign in again.');
    }
    if (!response.ok) throw new Error('Failed to reject document');
    return await response.json();
}

// Modify document
export async function modifyDocument(id, updates) {
    const token = getStoredToken();
    if (!token) {
        throw new Error('Authentication required');
    }

    const response = await fetch(`${API_URL}/api/documents/${id}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(updates)
    });
    const data = await response.json();
    if (response.status === 401) {
        localStorage.removeItem('token');
        sessionStorage.removeItem('token');
        throw new Error('Session expired. Please sign in again.');
    }
    if (!response.ok) throw new Error(data.message || 'Failed to modify document');
    return data;
}
  
// Download a single document
export async function downloadDocument(fileUrl) {
  try {
    const response = await fetch(fileUrl);
    if (!response.ok) throw new Error('Failed to download document');
    const blob = await response.blob();
    const fileName = fileUrl.split('/').pop();
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  } catch (err) {
    console.error('Error downloading document:', err);
    throw new Error('Failed to download document');
  }
}

// Download multiple documents as zip
export async function downloadMultipleDocuments(documents) {
  const JSZip = (await import('jszip')).default;
  const zip = new JSZip();
  
  try {
    // Add each file to the zip
    for (const doc of documents) {
      const response = await fetch(doc.fileUrl);
      if (!response.ok) throw new Error(`Failed to download ${doc.title}`);
      const blob = await response.blob();
      const fileName = doc.fileUrl.split('/').pop();
      zip.file(fileName, blob);
    }
    
    // Generate and download zip file
    const content = await zip.generateAsync({ type: 'blob' });
    const url = window.URL.createObjectURL(content);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'documents.zip';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  } catch (err) {
    console.error('Error downloading documents:', err);
    throw new Error('Failed to download documents');
  }
}

// Get justification document for a document
export async function getJustificationDocument(documentId) {
  const token = getStoredToken();
  if (!token) {
    throw new Error('Authentication required');
  }

  const response = await fetch(`${API_URL}/api/justification-documents/document/${documentId}`, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  
  if (response.status === 401) {
    localStorage.removeItem('token');
    sessionStorage.removeItem('token');
    throw new Error('Session expired. Please sign in again.');
  }
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Failed to fetch justification document');
  }
  
  return await response.json();
}

// Upload justification document
export async function uploadJustificationDocument(documentId, file) {
  const token = getStoredToken();
  if (!token) {
    throw new Error('Authentication required');
  }

  const formData = new FormData();
  formData.append('file', file);
  formData.append('documentId', documentId);

  const response = await fetch(`${API_URL}/api/justification-documents/upload`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`
    },
    body: formData
  });

  if (response.status === 401) {
    localStorage.removeItem('token');
    sessionStorage.removeItem('token');
    throw new Error('Session expired. Please sign in again.');
  }
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Failed to upload justification document');
  }

  return await response.json();
}