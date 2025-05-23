import API_URL from './config';

// Get documents for current user
export async function getDocuments(search = '', clientId) {
  if (!clientId) {
    throw new Error('Client ID is required');
  }

  const res = await fetch(`${API_URL}/api/documents?search=${encodeURIComponent(search)}&clientId=${clientId}`);
  if (!res.ok) throw new Error('Failed to fetch documents');
  return await res.json();
}

// Add new document
export async function addDocument(documentData, clientId) {
  if (!clientId) {
    throw new Error('Client ID is required');
  }

  try {
    // Create form data for file upload
    const formData = new FormData();
    
    // Add the file
    const fileUri = documentData.fileUrl;
    const filename = documentData.title;
    const type = documentData.fileType.toLowerCase();
    
    // Get file extension from the URI or filename
    const extension = (filename.match(/\.([^.]+)$/) || ['', 'jpg'])[1].toLowerCase();
    
    // Determine correct mime type
    const mimeType = extension === 'pdf' ? 'application/pdf' : 
                    (extension === 'jpg' || extension === 'jpeg') ? 'image/jpeg' :
                    extension === 'png' ? 'image/png' : 
                    'application/octet-stream';

    formData.append('file', {
      uri: fileUri,
      type: mimeType,
      name: filename || `document.${extension}`,
    });

    // Add document metadata
    formData.append('metadata', JSON.stringify({
      title: documentData.title,
      client: clientId,
      category: documentData.category,
      ...documentData.metadata
    }));

    console.log('Uploading document:', {
      uri: fileUri,
      type: mimeType,
      name: filename
    });

    const res = await fetch(`${API_URL}/api/documents/upload`, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
      },
      body: formData
    });

    if (!res.ok) {
      const errorData = await res.json();
      throw new Error(errorData.message || 'Failed to upload document');
    }

    const data = await res.json();
    return data;
  } catch (error) {
    console.error('Upload error:', error);
    throw error;
  }
}

// feature to be added

// Delete document
// export async function deleteDocument(id) {
//   const res = await fetch(`http://192.168.0.105:5000/api/documents/${id}`, {
//     method: 'DELETE'
//   });
//   if (!res.ok) throw new Error('Failed to delete document');
//   return await res.json();
// }

// // Modify document
// export async function modifyDocument(id, updates) {
//   const res = await fetch(`http://192.168.0.105:5000/api/documents/${id}`, {
//     method: 'PUT',
//     headers: {
//       'Content-Type': 'application/json'
//     },
//     body: JSON.stringify(updates)
//   });
//   const data = await res.json();
//   if (!res.ok) throw new Error(data.message || 'Failed to modify document');
//   return data;
// }