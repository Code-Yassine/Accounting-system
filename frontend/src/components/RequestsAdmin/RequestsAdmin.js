import React, { useState, useEffect, useCallback } from 'react';
import './RequestsAdmin.css';

import {
  getDeleteRequests,
  approveDeleteRequest,
  rejectDeleteRequest
} from '../../api/deleteRequests';
import { 
  FiSearch, 
  FiCheck, 
  FiX, 
  FiClock,
  FiLoader,
  FiAlertCircle,
  FiTrash2,
  FiUserX,
  FiFilter,
  FiChevronRight
} from 'react-icons/fi';

// Empty state component
function EmptyState({ isLoading, isFiltered }) {
  if (isLoading) {
    return (
      <div className="requests-empty-state">
        <FiLoader className="icon-spin" />
        <p>Loading delete requests...</p>
      </div>
    );
  }

  if (isFiltered) {
    return (
      <div className="requests-empty-state">
        <FiFilter />
        <p>No pending delete requests match your search criteria.</p>
      </div>
    );
  }

  return (
    <div className="requests-empty-state">
      <FiTrash2 size={24} />
      <p>No pending delete requests found.</p>
    </div>
  );
}

// Confirmation Modal Component
function ConfirmModal({ show, title, message, isDestructive, onConfirm, onCancel }) {
  if (!show) return null;

  return (
    <div className="modal-overlay">
      <div className="modal">
        <div className="modal-header">
          <h3 className="modal-title">{title}</h3>
        </div>
        <div className="modal-body">
          {isDestructive && <div className="modal-warning">
            <FiAlertCircle size={20} />
            <p>This action cannot be undone.</p>
          </div>}
          <p>{message}</p>
        </div>
        <div className="modal-actions">
          <button 
            type="button" 
            className="requests-btn requests-btn-outline" 
            onClick={onCancel}
          >
            <FiX /> Cancel
          </button>
          <button 
            type="button" 
            className={`requests-btn ${isDestructive ? 'requests-btn-danger' : 'requests-btn-primary'}`}
            onClick={onConfirm}
          >
            <FiCheck /> Confirm
          </button>
        </div>
      </div>
    </div>
  );
}

// Status Badge Component
function StatusBadge({ status }) {
  if (status === 'approved') {
    return (
      <span className="requests-status requests-status-approved">
        <FiCheck /> Approved
      </span>
    );
  } else if (status === 'rejected') {
    return (
      <span className="requests-status requests-status-rejected">
        <FiX /> Rejected
      </span>
    );
  } else {
    return (
      <span className="requests-status requests-status-pending">
        <FiClock /> Pending
      </span>
    );
  }
}

// Main RequestsAdmin Component
export default function RequestsAdmin() {
  const [deleteRequests, setDeleteRequests] = useState([]);
  const [filteredDeleteRequests, setFilteredDeleteRequests] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [confirmModal, setConfirmModal] = useState({
    show: false,
    title: '',
    message: '',
    action: null,
    requestId: null,
    isDestructive: false
  });

  // Fetch delete requests on initial load
  useEffect(() => {
    fetchDeleteRequests();
  }, []);

  // Filter delete requests when search term changes
  useEffect(() => {
    applyFilters(deleteRequests);
  }, [searchTerm, deleteRequests]);

  // Apply filters to requests
  const applyFilters = useCallback((requests) => {
    let filtered = [...requests];
    
    // Only show pending requests
    filtered = filtered.filter(request => request.status === 'pending');
    
    // Apply search filter
    if (searchTerm.trim() !== '') {
      const search = searchTerm.toLowerCase();
      filtered = filtered.filter(request => {
        // Check client info
        const clientName = request.clientId && typeof request.clientId === 'object' ? 
          request.clientId.name?.toLowerCase() : '';
        const clientEmail = request.clientId && typeof request.clientId === 'object' ? 
          request.clientId.email?.toLowerCase() : '';
          
        // Check accountant info
        const accountantName = request.accountantId && typeof request.accountantId === 'object' ? 
          request.accountantId.name?.toLowerCase() : '';
        const accountantEmail = request.accountantId && typeof request.accountantId === 'object' ? 
          request.accountantId.email?.toLowerCase() : '';
          
        return clientName.includes(search) || 
               clientEmail.includes(search) ||
               accountantName.includes(search) ||
               accountantEmail.includes(search);
      });
    }
    
    setFilteredDeleteRequests(filtered);
  }, [searchTerm]);

  // Fetch delete requests from API
  const fetchDeleteRequests = async () => {
    setIsLoading(true);
    setError('');
    
    try {
      const data = await getDeleteRequests();
      
      // Log a detailed view of the first request if available
      if (data && data.length > 0) {
        console.log("Example Delete Request Structure:", {
          _id: data[0]._id,
          clientId: data[0].clientId,
          accountantId: data[0].accountantId,
          status: data[0].status,
          createdAt: data[0].createdAt,
          // Show all fields from the first request
          fullRequest: data[0]
        });
      }
      
      // Filter out requests where:
      // 1. Client ID is missing/invalid
      const filteredData = data.filter(request => {
        // Skip requests with missing or invalid clientId
        if (!request.clientId || typeof request.clientId !== 'object') {
          return false;
        }
        
        // Skip requests with missing client name
        if (!request.clientId.name) {
          return false;
        }
        
        return true;
      });
      
      setDeleteRequests(filteredData);
      
      // Apply initial filtering
      applyFilters(filteredData);
    } catch (err) {
      setError(err.message || 'Failed to fetch delete requests');
      console.error('Error fetching delete requests:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Format date for better display
  const formatDate = (dateString) => {
    if (!dateString) return 'Unknown date';
    const date = new Date(dateString);
    
    // If date is invalid, return default message
    if (isNaN(date)) return 'Unknown date';
    
    // Format the date
    const options = { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    };
    
    return date.toLocaleDateString(undefined, options);
  };

  // Handle request approval
  const handleApprove = async (id) => {
    try {
      await approveDeleteRequest(id);
      
      // Instead of fetching all data again, just update the local state
      // by removing the approved request (since the client is deleted)
      setDeleteRequests(prev => prev.filter(req => req._id !== id));
      setFilteredDeleteRequests(prev => prev.filter(req => req._id !== id));
      
      setConfirmModal({ ...confirmModal, show: false });
    } catch (err) {
      setError(err.message || 'Failed to approve delete request');
      console.error('Error approving delete request:', err);
    }
  };

  // Handle request rejection
  const handleReject = async (id) => {
    try {
      await rejectDeleteRequest(id);
      await fetchDeleteRequests();
      setConfirmModal({ ...confirmModal, show: false });
    } catch (err) {
      setError(err.message || 'Failed to reject delete request');
      console.error('Error rejecting delete request:', err);
    }
  };

  // Handle confirmation action
  const handleConfirmAction = () => {
    const { action, requestId } = confirmModal;
    
    if (action === 'approve') {
      handleApprove(requestId);
    } else if (action === 'reject') {
      handleReject(requestId);
    }
  };

  return (
    <div className="requests-admin">
      <div className="requests-container">
        <div className="requests-header">
          <h1 className="requests-title">Delete Requests</h1>
          <p className="requests-description">Manage client deletion requests from accountants</p>
        </div>

        <div className="requests-actions">
          <div className="requests-search-container">
            <FiSearch className="requests-search-icon" />
            <input
              type="text"
              className="requests-search"
              placeholder="Search by client or accountant name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {error && <div className="requests-error">{error}</div>}

        <div className="requests-table-container">
          {filteredDeleteRequests.length === 0 ? (
            <EmptyState isLoading={isLoading} isFiltered={searchTerm.trim() !== ''} />
          ) : (
            <table className="requests-table">
              <thead>
                <tr>
                  <th>Client</th>
                  <th>Accountant</th>
                  <th>Requested On</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredDeleteRequests.map((request) => (
                  <tr key={request._id}>
                    <td>
                      <div className="requests-name">
                        {request.clientId?.name || 'Unknown Client'}
                      </div>
                      <div className="requests-email">
                        {request.clientId?.email || 'No email'}
                      </div>
                    </td>
                    <td>
                      <div className="requests-name">
                        {request.accountantId?.name || 'Unknown Accountant'}
                      </div>
                      <div className="requests-email">
                        {request.accountantId?.email || 'No email'}
                      </div>
                    </td>
                    <td>{formatDate(request.createdAt)}</td>
                    <td>
                      <StatusBadge status={request.status} />
                    </td>
                    <td className="requests-actions-cell">
                      <button
                        className="requests-action-btn requests-action-approve"
                        onClick={() => setConfirmModal({
                          show: true,
                          title: 'Approve Delete Request',
                          message: `Are you sure you want to approve the deletion request for ${request.clientId?.name || 'this client'}?`,
                          action: 'approve', // Changed from function to string
                          requestId: request._id,
                          isDestructive: true
                        })}
                      >
                        <FiCheck /> Approve
                      </button>
                      <button
                        className="requests-action-btn requests-action-reject"
                        onClick={() => setConfirmModal({
                          show: true,
                          title: 'Reject Delete Request',
                          message: `Are you sure you want to reject the deletion request for ${request.clientId?.name || 'this client'}?`,
                          action: 'reject', // Changed from function to string
                          requestId: request._id,
                          isDestructive: false
                        })}
                      >
                        <FiX /> Reject
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      <ConfirmModal
        show={confirmModal.show}
        title={confirmModal.title}
        message={confirmModal.message}
        isDestructive={confirmModal.isDestructive}
        onConfirm={handleConfirmAction}
        onCancel={() => setConfirmModal({ ...confirmModal, show: false })}
      />
    </div>
  );
}