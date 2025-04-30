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
  FiLoader
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
        <p>No pending delete requests match your search criteria.</p>
      </div>
    );
  }

  return (
    <div className="requests-empty-state">
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

// Main DeleteRequestsAdmin Component
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
      {/* Confirmation Modal */}
      <ConfirmModal 
        {...confirmModal}
        onConfirm={handleConfirmAction}
        onCancel={() => setConfirmModal({ ...confirmModal, show: false })}
      />
      
      <div className="requests-container">
        {error && <div className="requests-error">{error}</div>}
        
        <div className="requests-header">
          <h1 className="requests-title">Delete Requests</h1>
          
          <div className="requests-actions">
            <div className="requests-search-container">
              <span className="requests-search-icon">
                <FiSearch />
              </span>
              <input
                type="text"
                className="requests-search"
                placeholder="Search by client or accountant..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                aria-label="Search requests"
              />
            </div>
          </div>
        </div>
        
        <div className="requests-table-container">
          {filteredDeleteRequests.length === 0 ? (
            <EmptyState 
              isLoading={isLoading} 
              isFiltered={searchTerm.trim() !== ''}
            />
          ) : (
            <table className="requests-table">
              <thead>
                <tr>
                  <th>CLIENT</th>
                  <th>ACCOUNTANT</th>
                  <th>STATUS</th>
                  <th>DATE</th>
                  <th>ACTIONS</th>
                </tr>
              </thead>
              <tbody>
                {filteredDeleteRequests.map((deleteRequest) => {
                  // Client info
                  const clientName = deleteRequest.clientId && typeof deleteRequest.clientId === 'object' 
                    ? deleteRequest.clientId.name 
                    : 'Unknown Client';
                  const clientEmail = deleteRequest.clientId && typeof deleteRequest.clientId === 'object' 
                    ? deleteRequest.clientId.email 
                    : '';
                  
                  // Accountant info
                  const accountantName = deleteRequest.accountantId && typeof deleteRequest.accountantId === 'object' 
                    ? deleteRequest.accountantId.name 
                    : 'Unknown Accountant';
                  const accountantEmail = deleteRequest.accountantId && typeof deleteRequest.accountantId === 'object' 
                    ? deleteRequest.accountantId.email 
                    : '';
                  
                  // Status info
                  const status = deleteRequest.status || 'pending';
                  
                  return (
                    <tr key={deleteRequest._id}>
                      {/* CLIENT COLUMN */}
                      <td className="requests-name">
                        {clientName}
                        <span className="requests-email">{clientEmail}</span>
                      </td>
                      
                      {/* ACCOUNTANT COLUMN */}
                      <td className="requests-name">
                        {accountantName}
                        <span className="requests-email">{accountantEmail}</span>
                      </td>
                      
                      {/* STATUS COLUMN */}
                      <td>
                        <span className={`requests-status ${
                          status === 'approved' 
                            ? 'requests-status-approved'
                            : status === 'rejected'
                              ? 'requests-status-rejected' 
                              : 'requests-status-pending'
                        }`}>
                          {status === 'approved' ? (
                            <>
                              <FiCheck /> Approved
                            </>
                          ) : status === 'rejected' ? (
                            <>
                              <FiX /> Rejected
                            </>
                          ) : (
                            <>
                              <FiClock /> Pending
                            </>
                          )}
                        </span>
                      </td>
                      
                      {/* DATE COLUMN */}
                      <td>
                        {deleteRequest.createdAt ? new Date(deleteRequest.createdAt).toLocaleDateString() : 'Unknown date'}
                      </td>
                      
                      {/* ACTIONS COLUMN */}
                      <td className="requests-actions-cell">
                        {status === 'pending' && (
                          <>
                            <button
                              className="requests-action-btn requests-action-approve"
                              onClick={() => setConfirmModal({
                                show: true,
                                title: 'Approve Delete Request',
                                message: `Are you sure you want to approve the delete request for ${clientName}? This will permanently delete the client.`,
                                action: 'approve',
                                requestId: deleteRequest._id,
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
                                message: `Are you sure you want to reject the delete request for ${clientName}?`,
                                action: 'reject',
                                requestId: deleteRequest._id,
                                isDestructive: false
                              })}
                            >
                              <FiX /> Reject
                            </button>
                          </>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}