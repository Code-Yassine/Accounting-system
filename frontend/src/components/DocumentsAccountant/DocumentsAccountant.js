import React, { useState, useEffect, useCallback } from 'react';
import './DocumentsAccountant.css';
import { 
  FiInfo,
  FiSearch, 
  FiFileText, 
  FiCheck, 
  FiX, 
  FiEdit2,
  FiZoomIn,
  FiZoomOut,
  FiRotateCcw,
  FiRotateCw,
  FiDownload,
  FiLoader,
  FiChevronLeft,
  FiChevronRight,
  FiFile
} from 'react-icons/fi';
import { 
  getMyDocuments,
  setDocumentProcessed, 
  rejectDocument, 
  modifyDocument,
  downloadDocument,
  downloadMultipleDocuments,
  getJustificationDocument
} from '../../api/documents';

// Document Viewer Modal Component
function DocumentViewerModal({ show, document, onClose }) {
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);

  if (!show || !document) return null;

  const handleZoomIn = () => {
    setZoom(prev => Math.min(prev + 0.1, 3));
  };

  const handleZoomOut = () => {
    setZoom(prev => Math.max(prev - 0.1, 0.5));
  };

  const handleRotateLeft = () => {
    setRotation(prev => (prev - 90) % 360);
  };

  const handleRotateRight = () => {
    setRotation(prev => (prev + 90) % 360);
  };

  return (
    <div className="modal-overlay">
      <div className="document-viewer-modal">
        <div className="document-viewer-header">
          <h3 className="document-viewer-title">{document.title}</h3>
          <div className="document-viewer-client">
            Uploaded by: <strong>{document.client?.name || 'Unknown'}</strong>
          </div>
          <div className="document-viewer-controls">
            <button className="document-viewer-btn" onClick={handleZoomIn}>
              <FiZoomIn /> Zoom In
            </button>
            <button className="document-viewer-btn" onClick={handleZoomOut}>
              <FiZoomOut /> Zoom Out
            </button>
            <button className="document-viewer-btn" onClick={handleRotateLeft}>
              <FiRotateCcw /> Rotate Left
            </button>
            <button className="document-viewer-btn" onClick={handleRotateRight}>
              <FiRotateCw /> Rotate Right
            </button>
            <button className="document-viewer-btn document-viewer-btn-close" onClick={onClose}>
              <FiX /> Close
            </button>
          </div>
        </div>
        <div className="document-viewer-content">
          {document.fileType === 'pdf' ? (
            <iframe
              src={document.fileUrl}
              style={{
                width: '100%',
                height: '100%',
                transform: `scale(${zoom}) rotate(${rotation}deg)`,
                transformOrigin: 'center center'
              }}
              title={document.title}
            />
          ) : (
            <img
              src={document.fileUrl}
              alt={document.title}
              style={{
                maxWidth: '100%',
                maxHeight: '100%',
                transform: `scale(${zoom}) rotate(${rotation}deg)`,
                transformOrigin: 'center center'
              }}
            />
          )}
        </div>
      </div>
    </div>
  );
}

// Edit Document Modal Component
function EditDocumentModal({ show, document, onClose, onSubmit, isLoading, error }) {  const [formData, setFormData] = useState({
    title: '',
    partyName: '',
    reference: '',
    amount: '',
    date: ''
  });

  useEffect(() => {
    if (document) {
      setFormData({
        title: document.title || '',
        partyName: document.metadata?.partyName || '',
        reference: document.metadata?.reference || '',
        amount: document.metadata?.amount || '',
        date: document.metadata?.date?.split('T')[0] || ''
      });
    }
  }, [document]);

  const handleSubmit = (e) => {
    e.preventDefault();
    // Only include fields that have been changed
    const changedFields = {};    if (formData.title !== document.title) changedFields.title = formData.title;
    if (formData.partyName !== document.metadata?.partyName) changedFields.partyName = formData.partyName;
    if (formData.reference !== document.metadata?.reference) changedFields.reference = formData.reference;
    if (formData.amount !== document.metadata?.amount) changedFields.amount = formData.amount;
    if (formData.date !== document.metadata?.date?.split('T')[0]) changedFields.date = formData.date;
    
    onSubmit(changedFields);
  };

  if (!show) return null;

  return (
    <div className="modal-overlay">
      <div className="modal">
        <div className="modal-header">
          <h3 className="modal-title">Edit Document Details</h3>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="form-group">
              <label htmlFor="title" className="form-label">Title</label>
              <input
                id="title"
                type="text"
                className="form-control"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Enter document title"
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="partyName" className="form-label">Party Name</label>
              <input
                id="partyName"
                type="text"
                className="form-control"
                value={formData.partyName}
                onChange={(e) => setFormData(prev => ({ ...prev, partyName: e.target.value }))}
                placeholder="Enter party name"
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="reference" className="form-label">Reference</label>
              <input
                id="reference"
                type="text"
                className="form-control"
                value={formData.reference}
                onChange={(e) => setFormData(prev => ({ ...prev, reference: e.target.value }))}
                placeholder="Enter reference number"
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="amount" className="form-label">Amount</label>
              <input
                id="amount"
                type="number"
                className="form-control"
                value={formData.amount}
                onChange={(e) => setFormData(prev => ({ ...prev, amount: e.target.value }))}
                placeholder="Enter amount"
              />
            </div>
            
              <div className="form-group">
              <label htmlFor="date" className="form-label">Date</label>
              <input
                id="date"
                type="date"
                className="form-control"
                value={formData.date}
                onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
              />
            </div>
            
            {error && <div className="form-error">{error}</div>}
          </div>
          <div className="modal-actions">
            <button 
              type="button" 
              className="documents-btn documents-btn-outline" 
              onClick={onClose}
              disabled={isLoading}
            >
              <FiX /> Cancel
            </button>
            <button 
              type="submit" 
              className="documents-btn documents-btn-primary"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <FiLoader className="icon-spin" /> Saving...
                </>
              ) : (
                <>
                  <FiEdit2 /> Save Changes
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Document Details Modal Component
function DocumentDetailsModal({ show, document, onClose }) {
  const [currentPage, setCurrentPage] = useState(1);

  if (!show || !document) return null;

  const formatDate = (date) => {
    return new Date(date).toLocaleString();
  };
  const sections = [
    {
      title: "General Information",
      content: (
        <>
          <div className="details-group">
            <label>Title</label>
            <p>{document.title}</p>
          </div>
          
          <div className="details-group">
            <label>Client</label>
            <p>{document.client?.name || 'Unknown'}</p>
          </div>
          
          <div className="details-group">
            <label>Category</label>
            <p>{document.category}</p>
          </div>
          
          <div className="details-group">
            <label>Status</label>
            <p className={`status-${document.status}`}>
              {document.status.charAt(0).toUpperCase() + document.status.slice(1)}
            </p>
          </div>

          <div className="details-group">
            <label>Upload Date</label>
            <p>{formatDate(document.createdAt)}</p>
          </div>
        </>
      )
    },
    {
      title: "Document Metadata",
      content: document.metadata && (
        <>
          <div className="details-group">
            <label>Party Name</label>
            <p>{document.metadata.partyName}</p>
          </div>
          
          <div className="details-group">
            <label>Party Type</label>
            <p>{document.metadata.partyType}</p>
          </div>
          
          <div className="details-group">
            <label>Reference</label>
            <p>{document.metadata.reference}</p>
          </div>
          
          <div className="details-group">
            <label>Amount</label>
            <p>{document.metadata.amount}</p>
          </div>
          
          <div className="details-group">
            <label>Date</label>
            <p>{formatDate(document.metadata.date)}</p>
          </div>
          
          {document.metadata.notes && (
            <div className="details-group full-width">
              <label>Notes</label>
              <p>{document.metadata.notes}</p>
            </div>
          )}
        </>
      )
    }
  ].filter(section => section.content);

  return (
    <div className="modal-overlay">
      <div className="modal">
        <div className="modal-header">
          <h3 className="modal-title">Document Details</h3>
        </div>
        <div className="modal-body">
          <div className="modal-content">
            <div className="details-grid">
              <h4>{sections[currentPage - 1].title}</h4>
              {sections[currentPage - 1].content}
            </div>
          </div>
          <div className="modal-pagination">
            <div className="pagination-info">
              {`Page ${currentPage} of ${sections.length}`}
            </div>
            <div className="pagination-buttons">              <button 
                className="pagination-btn"
                onClick={() => setCurrentPage(prev => prev - 1)}
                disabled={currentPage === 1}
              >
                <FiChevronLeft /> Previous
              </button>
              {Array.from({length: sections.length}, (_, i) => i + 1).map(page => (
                <button
                  key={page}
                  className={`pagination-btn ${page === currentPage ? 'active' : ''}`}
                  onClick={() => setCurrentPage(page)}
                >
                  {page}
                </button>
              ))}
              <button 
                className="pagination-btn"
                onClick={() => setCurrentPage(prev => prev + 1)}
                disabled={currentPage === sections.length}
              >
                Next <FiChevronRight />
              </button>
            </div>
          </div>
        </div>
        <div className="modal-actions">
          <button 
            className="documents-btn documents-btn-primary" 
            onClick={onClose}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

// Justification Document Viewer Modal Component
function JustificationViewerModal({ show, document, onClose }) {
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [justification, setJustification] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (show && document) {
      setLoading(true);
      getJustificationDocument(document._id)
        .then(data => {
          setJustification(data);
          setError('');
        })
        .catch(err => {
          setError(err.message);
          setJustification(null);
        })
        .finally(() => setLoading(false));
    }
  }, [show, document]);

  if (!show || !document) return null;

  const handleZoomIn = () => {
    setZoom(prev => Math.min(prev + 0.1, 3));
  };

  const handleZoomOut = () => {
    setZoom(prev => Math.max(prev - 0.1, 0.5));
  };

  const handleRotateLeft = () => {
    setRotation(prev => (prev - 90) % 360);
  };

  const handleRotateRight = () => {
    setRotation(prev => (prev + 90) % 360);
  };

  return (
    <div className="modal-overlay">
      <div className="document-viewer-modal">
        <div className="document-viewer-header">
          <h3 className="document-viewer-title">Justification Document</h3>
          <div className="document-viewer-controls">
            <button className="document-viewer-btn" onClick={handleZoomIn}>
              <FiZoomIn /> Zoom In
            </button>
            <button className="document-viewer-btn" onClick={handleZoomOut}>
              <FiZoomOut /> Zoom Out
            </button>
            <button className="document-viewer-btn" onClick={handleRotateLeft}>
              <FiRotateCcw /> Rotate Left
            </button>
            <button className="document-viewer-btn" onClick={handleRotateRight}>
              <FiRotateCw /> Rotate Right
            </button>
            <button className="document-viewer-btn document-viewer-btn-close" onClick={onClose}>
              <FiX /> Close
            </button>
          </div>
        </div>
        <div className="document-viewer-content">
          {loading ? (
            <div className="documents-loading">
              <div className="documents-loading-spinner"></div>
              <p>Loading justification document...</p>
            </div>
          ) : error ? (
            <div className="documents-error">
              <p>{error}</p>
            </div>
          ) : justification ? (
            justification.fileType === 'pdf' ? (
              <iframe
                src={justification.fileUrl}
                style={{
                  width: '100%',
                  height: '100%',
                  transform: `scale(${zoom}) rotate(${rotation}deg)`,
                  transformOrigin: 'center center'
                }}
                title="Justification Document"
              />
            ) : (
              <img
                src={justification.fileUrl}
                alt="Justification Document"
                style={{
                  maxWidth: '100%',
                  maxHeight: '100%',
                  transform: `scale(${zoom}) rotate(${rotation}deg)`,
                  transformOrigin: 'center center'
                }}
              />
            )
          ) : (
            <div className="documents-empty">
              <FiFileText />
              <p>No justification document found</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Empty State Component
function EmptyState({ isLoading, isFiltered, statusFilter }) {
  if (isLoading) {
    return (
      <div className="documents-loading">
        <div className="documents-loading-spinner"></div>
        <p>Loading documents...</p>
      </div>
    );
  }
  
  return (
    <div className="documents-empty">
      {isFiltered ? (
        <>
          <FiSearch />
          <p>No documents match your search criteria.</p>
        </>
      ) : statusFilter !== 'all' ? (
        <>
          <FiFileText />
          <p>No documents with "{statusFilter}" status found.</p>
        </>
      ) : (
        <>
          <FiFileText />
          <p>No documents have been uploaded yet.</p>
        </>
      )}
    </div>
  );
}

// Main DocumentsAccountant Component
export default function DocumentsAccountant() {
  const [documents, setDocuments] = useState([]);
  const [filteredDocuments, setFilteredDocuments] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedDocument, setSelectedDocument] = useState(null);
  const [isViewerOpen, setIsViewerOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedDocuments, setSelectedDocuments] = useState(new Set());
  const [isDownloading, setIsDownloading] = useState(false);
  const [isJustificationViewerOpen, setIsJustificationViewerOpen] = useState(false);

  useEffect(() => {
    fetchDocuments();
  }, []);

  useEffect(() => {
    let filtered = [...documents];
    
    if (statusFilter !== 'all') {
      filtered = filtered.filter(doc => doc.status === statusFilter);
    }      if (searchTerm.trim() !== '') {
      const search = searchTerm.toLowerCase();
      filtered = filtered.filter(doc => 
        doc.title.toLowerCase().includes(search) || 
        doc.client?.name?.toLowerCase().includes(search) ||
        doc.category?.toLowerCase().includes(search) ||
        new Date(doc.metadata?.date).toLocaleDateString().toLowerCase().includes(search)
      );
    }
    
    setFilteredDocuments(filtered);
  }, [searchTerm, statusFilter, documents]);
  const fetchDocuments = useCallback(async () => {
    setIsLoading(true);
    setError('');
    
    try {
      console.log('Fetching documents with search term:', searchTerm);
      const data = await getMyDocuments(searchTerm);
      console.log('Received documents:', data);
      setDocuments(data);
      setFilteredDocuments(data);
    } catch (err) {
      console.error('Detailed error:', err);
      setError(err.message || 'Failed to fetch documents');
    } finally {
      setIsLoading(false);
    }
  }, [searchTerm]);

  const handleStatusChange = async (documentId, newStatus) => {
    try {
      if (newStatus === 'processed') {
        await setDocumentProcessed(documentId);
      } else if (newStatus === 'rejected') {
        await rejectDocument(documentId);
      }
      await fetchDocuments();
    } catch (err) {
      setError('Failed to update document status');
      console.error('Error updating document status:', err);
    }
  };

  const handleEditDocument = async (formData) => {
    setIsEditing(true);
    setError('');

    try {
      // List all required metadata fields
      const requiredMetadataFields = [
        'date',
        'amount',
        'partyName',
        'partyType',
        'reference',
        'notes'
      ];

      // Start with the current metadata
      const currentMetadata = selectedDocument.metadata || {};
      const updatedMetadata = { ...currentMetadata };

      // Overwrite with any changed fields from the form
      for (const key of requiredMetadataFields) {
        if (formData[key] !== undefined) {
          updatedMetadata[key] = formData[key];
        }
      }

      // Prepare the update data
      const updateData = {};
      if (formData.title !== undefined) updateData.title = formData.title;
      updateData.metadata = updatedMetadata; // Always send full metadata

      await modifyDocument(selectedDocument._id, updateData);
      await fetchDocuments();
      setIsEditModalOpen(false);
    } catch (err) {
      setError(err.message || 'Failed to update document');
      console.error('Error updating document:', err);
    } finally {
      setIsEditing(false);
    }
  };

  const handleDownloadSingle = async (doc) => {
    try {
      setIsDownloading(true);
      await downloadDocument(doc.fileUrl);
    } catch (err) {
      setError('Failed to download document');
      console.error('Error downloading document:', err);
    } finally {
      setIsDownloading(false);
    }
  };

  const handleDownloadSelected = async () => {
    if (selectedDocuments.size === 0) {
      setError('Please select documents to download');
      return;
    }

    try {
      setIsDownloading(true);
      const docsToDownload = filteredDocuments.filter(doc => selectedDocuments.has(doc._id));
      await downloadMultipleDocuments(docsToDownload);
      setSelectedDocuments(new Set()); // Clear selection after download
    } catch (err) {
      setError('Failed to download selected documents');
      console.error('Error downloading documents:', err);
    } finally {
      setIsDownloading(false);
    }
  };

  const toggleDocumentSelection = (docId) => {
    const newSelection = new Set(selectedDocuments);
    if (newSelection.has(docId)) {
      newSelection.delete(docId);
    } else {
      newSelection.add(docId);
    }
    setSelectedDocuments(newSelection);
  };

  const selectAllDocuments = () => {
    if (selectedDocuments.size === filteredDocuments.length) {
      setSelectedDocuments(new Set());
    } else {
      setSelectedDocuments(new Set(filteredDocuments.map(doc => doc._id)));
    }
  };

  return (
    <div className="documents-accountant">
      {/* Document Viewer Modal */}
      <DocumentViewerModal
        show={isViewerOpen}
        document={selectedDocument}
        onClose={() => setIsViewerOpen(false)}
      />
      
      {/* Edit Document Modal */}
      <EditDocumentModal
        show={isEditModalOpen}
        document={selectedDocument}
        onClose={() => setIsEditModalOpen(false)}
        onSubmit={handleEditDocument}
        isLoading={isEditing}
        error={error}
      />

      {/* Document Details Modal */}
      <DocumentDetailsModal
        show={isDetailsModalOpen}
        document={selectedDocument}
        onClose={() => setIsDetailsModalOpen(false)}
      />
      
      {/* Justification Document Viewer Modal */}
      <JustificationViewerModal
        show={isJustificationViewerOpen}
        document={selectedDocument}
        onClose={() => setIsJustificationViewerOpen(false)}
      />
      
      <div className="documents-container">
        {error && <div className="documents-error">{error}</div>}
        
        <div className="documents-actions">
          <div className="documents-search-container">
            <span className="documents-search-icon">
              <FiSearch />
            </span>
            <input
              type="text"
              className="documents-search"
              placeholder="Search documents by title, client, category, or date..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              aria-label="Search documents"
            />
          </div>
          
          <div className="documents-filter-buttons">
            <button 
              className={`documents-filter-btn ${statusFilter === 'all' ? 'active' : ''}`}
              onClick={() => setStatusFilter('all')}
            >
              All
            </button>
            <button 
              className={`documents-filter-btn ${statusFilter === 'new' ? 'active' : ''}`}
              onClick={() => setStatusFilter('new')}
            >
              <FiFileText className="filter-icon" /> New
            </button>
            <button 
              className={`documents-filter-btn ${statusFilter === 'processed' ? 'active' : ''}`}
              onClick={() => setStatusFilter('processed')}
            >
              <FiCheck className="filter-icon" /> Processed
            </button>
            <button 
              className={`documents-filter-btn ${statusFilter === 'rejected' ? 'active' : ''}`}
              onClick={() => setStatusFilter('rejected')}
            >
              <FiX className="filter-icon" /> Rejected
            </button>
          </div>
        </div>
        
        <div className="documents-bulk-actions">
          {filteredDocuments.length > 0 && (
            <button 
              className="documents-btn documents-btn-primary"
              onClick={handleDownloadSelected}
              disabled={selectedDocuments.size === 0 || isDownloading}
            >
              {isDownloading ? (
                <>
                  <FiLoader className="icon-spin" /> Downloading...
                </>
              ) : (
                <>
                  <FiDownload /> Download Selected ({selectedDocuments.size})
                </>
              )}
            </button>
          )}
        </div>
        
        <div className="documents-table-container">
          {filteredDocuments.length === 0 ? (
            <EmptyState 
              isLoading={isLoading} 
              isFiltered={searchTerm.trim() !== ''}
              statusFilter={statusFilter}
            />
          ) : (
            <table className="documents-table">
              <thead>
                <tr>
                  <th>
                    <input
                      type="checkbox"
                      checked={selectedDocuments.size === filteredDocuments.length}
                      onChange={selectAllDocuments}
                      className="documents-checkbox"
                    />
                  </th>
                  <th>TITLE</th>
                  <th>CLIENT</th>
                  <th>CATEGORY</th>
                  <th>DATE</th>
                  <th>STATUS</th>
                  <th>ACTIONS</th>
                </tr>
              </thead>
              <tbody>
                {filteredDocuments.map((doc) => (
                  <tr key={doc._id}>
                    <td>
                      <input
                        type="checkbox"
                        checked={selectedDocuments.has(doc._id)}
                        onChange={() => toggleDocumentSelection(doc._id)}
                        className="documents-checkbox"
                      />
                    </td>
                    <td className="documents-title">{doc.title}</td>
                    <td className="documents-client">
                      {doc.client?.name || 'Unknown'}
                    </td>
                    <td className="documents-category">{doc.category}</td>
                    <td className="documents-date">
                      {new Date(doc.metadata?.date).toLocaleDateString()}
                    </td>
                    <td>
                      <span className={`documents-status ${
                        doc.status === 'processed' 
                          ? 'documents-status-processed'
                          : doc.status === 'rejected'
                            ? 'documents-status-rejected' 
                            : 'documents-status-new'
                      }`}>
                        {doc.status === 'processed' ? (
                          <>
                            <FiCheck /> Processed
                          </>
                        ) : doc.status === 'rejected' ? (
                          <>
                            <FiX /> Rejected
                          </>
                        ) : (
                          <>
                            <FiFileText /> New
                          </>
                        )}
                      </span>
                    </td>
                    <td className="documents-actions-cell">
                      <button 
                        className="documents-action-btn documents-action-btn-blue"
                        onClick={() => {
                          setSelectedDocument(doc);
                          setIsViewerOpen(true);
                        }}
                        aria-label="View document"
                        title="View document"
                      >
                        <FiZoomIn />
                      </button>
                      
                      <button 
                        className="documents-action-btn documents-action-btn-info"
                        onClick={() => {
                          setSelectedDocument(doc);
                          setIsDetailsModalOpen(true);
                        }}
                        aria-label="View details"
                        title="View details"
                      >
                        <FiInfo />
                      </button>
                      
                      <button 
                        className="documents-action-btn documents-action-btn-green"
                        onClick={() => {
                          setSelectedDocument(doc);
                          setIsEditModalOpen(true);
                        }}
                        aria-label="Edit document"
                        title="Edit document"
                      >
                        <FiEdit2 />
                      </button>
                      
                      <button 
                        className="documents-action-btn documents-action-btn-green"
                        onClick={() => handleStatusChange(doc._id, 'processed')}
                        aria-label="Mark as processed"
                        title="Mark as processed"
                      >
                        <FiCheck />
                      </button>
                      
                      <button 
                        className="documents-action-btn documents-action-btn-red"
                        onClick={() => handleStatusChange(doc._id, 'rejected')}
                        aria-label="Reject document"
                        title="Reject document"
                      >
                        <FiX />
                      </button>
                      
                      <button 
                        className="documents-action-btn documents-action-btn-blue"
                        onClick={() => handleDownloadSingle(doc)}
                        disabled={isDownloading}
                        aria-label="Download document"
                        title="Download document"
                      >
                        <FiDownload />
                      </button>
                      
                      <button 
                        className="documents-action-btn documents-action-btn-info"
                        onClick={() => {
                          setSelectedDocument(doc);
                          setIsJustificationViewerOpen(true);
                        }}
                        aria-label="View justification"
                        title="View justification"
                      >
                        <FiFile />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
