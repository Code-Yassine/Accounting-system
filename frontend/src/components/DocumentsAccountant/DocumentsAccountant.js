import React, { useState, useEffect } from 'react';
import './DocumentsAccountant.css';
import { 
  FiSearch, 
  FiFileText, 
  FiCheck, 
  FiX, 
  FiEdit2,
  FiZoomIn,
  FiZoomOut,
  FiRotateCcw,
  FiRotateCw,
  FiFilter,
  FiUpload,
  FiLoader,
  FiAlertCircle
} from 'react-icons/fi';
import { 
  getAllDocuments, 
  setDocumentProcessed, 
  rejectDocument, 
  modifyDocument 
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
function EditDocumentModal({ show, document, onClose, onSubmit, isLoading, error }) {
  const [formData, setFormData] = useState({
    title: '',
    partyName: '',
    reference: '',
    amount: '',
    notes: ''
  });

  useEffect(() => {
    if (document) {
      setFormData({
        title: document.title || '',
        partyName: document.metadata?.partyName || '',
        reference: document.metadata?.reference || '',
        amount: document.metadata?.amount || '',
        notes: document.metadata?.notes || ''
      });
    }
  }, [document]);

  const handleSubmit = (e) => {
    e.preventDefault();
    // Only include fields that have been changed
    const changedFields = {};
    if (formData.title !== document.title) changedFields.title = formData.title;
    if (formData.partyName !== document.metadata?.partyName) changedFields.partyName = formData.partyName;
    if (formData.reference !== document.metadata?.reference) changedFields.reference = formData.reference;
    if (formData.amount !== document.metadata?.amount) changedFields.amount = formData.amount;
    if (formData.notes !== document.metadata?.notes) changedFields.notes = formData.notes;
    
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
              <label htmlFor="notes" className="form-label">Notes</label>
              <textarea
                id="notes"
                className="form-control"
                value={formData.notes}
                onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                placeholder="Enter any additional notes"
                rows={4}
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
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    fetchDocuments();
  }, []);

  useEffect(() => {
    let filtered = [...documents];
    
    if (statusFilter !== 'all') {
      filtered = filtered.filter(doc => doc.status === statusFilter);
    }
    
    if (searchTerm.trim() !== '') {
      const search = searchTerm.toLowerCase();
      filtered = filtered.filter(doc => 
        doc.title.toLowerCase().includes(search) || 
        doc.metadata?.partyName?.toLowerCase().includes(search) ||
        doc.metadata?.reference?.toLowerCase().includes(search)
      );
    }
    
    setFilteredDocuments(filtered);
  }, [searchTerm, statusFilter, documents]);

  const fetchDocuments = async () => {
    setIsLoading(true);
    setError('');
    
    try {
      const data = await getAllDocuments(searchTerm);
      setDocuments(data);
      setFilteredDocuments(data);
    } catch (err) {
      setError('Failed to fetch documents');
      console.error('Error fetching documents:', err);
    } finally {
      setIsLoading(false);
    }
  };

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
              placeholder="Search documents by title, party name, or reference..."
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
                  <th>TITLE</th>
                  <th>PARTY NAME</th>
                  <th>REFERENCE</th>
                  <th>STATUS</th>
                  <th>ACTIONS</th>
                </tr>
              </thead>
              <tbody>
                {filteredDocuments.map((doc) => (
                  <tr key={doc._id}>
                    <td className="documents-title">{doc.title}</td>
                    <td className="documents-party">{doc.metadata?.partyName}</td>
                    <td className="documents-reference">{doc.metadata?.reference}</td>
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
