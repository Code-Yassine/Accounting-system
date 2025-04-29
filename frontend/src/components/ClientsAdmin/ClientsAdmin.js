import React, { useState, useEffect } from 'react';
import './ClientsAdmin.css';
import {
  getAllClients,
  addClient,
  acceptClient,
  rejectClient,
  deleteClient,
  modifyClient
} from '../../api/clients';
import { getAccountants } from '../../api/accountants';
import { 
  FiSearch, 
  FiUserPlus, 
  FiCheck, 
  FiX, 
  FiTrash2, 
  FiEdit2,
  FiUserX, 
  FiUser, 
  FiUsers,
  FiAlertTriangle,
  FiLoader,
  FiClock,
  FiFilter
} from 'react-icons/fi';

// Confirmation Modal Component
function ConfirmModal({ show, title, message, confirmText, cancelText, onConfirm, onCancel, isDestructive }) {
  if (!show) return null;
  
  return (
    <div className="modal-overlay">
      <div className="modal">
        <div className="modal-header">
          <h3 className="modal-title">{title}</h3>
        </div>
        <div className="modal-body">
          <div className="modal-message">{message}</div>
        </div>
        <div className="modal-actions">
          <button 
            className={`accountants-btn ${isDestructive ? 'accountants-btn-outline' : 'accountants-btn-primary'}`} 
            onClick={onCancel}
          >
            <FiX /> {cancelText || 'Cancel'}
          </button>
          <button 
            className={`accountants-btn ${isDestructive ? 'accountants-btn-primary' : 'accountants-btn-outline'}`}
            onClick={onConfirm}
          >
            {confirmText || 'Confirm'}
          </button>
        </div>
      </div>
    </div>
  );
}

// Add Client Modal Component
function AddClientModal({ show, onClose, onSubmit, isLoading, error }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [formErrors, setFormErrors] = useState({});

  // Reset form when modal closes
  useEffect(() => {
    if (!show) {
      setName('');
      setEmail('');
      setPassword('');
      setConfirmPassword('');
      setFormErrors({});
    }
  }, [show]);

  const validate = () => {
    const errors = {};
    
    if (!name.trim()) errors.name = 'Name is required';
    if (!email.trim()) errors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(email)) errors.email = 'Email is invalid';
    
    if (!password) errors.password = 'Password is required';
    else if (password.length < 6) errors.password = 'Password must be at least 6 characters';
    
    if (password !== confirmPassword) errors.confirmPassword = 'Passwords do not match';
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (validate()) {
      onSubmit({ name, email, password }); 
    }
  };

  if (!show) return null;

  return (
    <div className="modal-overlay">
      <div className="modal">
        <div className="modal-header">
          <h3 className="modal-title">Add New Client</h3>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="form-group">
              <label htmlFor="name" className="form-label">Name</label>
              <input
                id="name"
                type="text"
                className="form-control"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter full name"
                autoComplete="off"
              />
              {formErrors.name && <div className="form-error">{formErrors.name}</div>}
            </div>
            
            <div className="form-group">
              <label htmlFor="email" className="form-label">Email</label>
              <input
                id="email"
                type="email"
                className="form-control"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter email address"
                autoComplete="off"
              />
              {formErrors.email && <div className="form-error">{formErrors.email}</div>}
            </div>
            
            <div className="form-group">
              <label htmlFor="password" className="form-label">Password</label>
              <input
                id="password"
                type="password"
                className="form-control"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                autoComplete="new-password"
              />
              {formErrors.password && <div className="form-error">{formErrors.password}</div>}
            </div>
            
            <div className="form-group">
              <label htmlFor="confirmPassword" className="form-label">Confirm Password</label>
              <input
                id="confirmPassword"
                type="password"
                className="form-control"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm password"
                autoComplete="new-password"
              />
              {formErrors.confirmPassword && <div className="form-error">{formErrors.confirmPassword}</div>}
            </div>
            
            {error && <div className="form-error">{error}</div>}
          </div>
          
          <div className="modal-actions">
            <button 
              type="button" 
              className="clients-btn clients-btn-outline" 
              onClick={onClose}
              disabled={isLoading}
            >
              <FiX /> Cancel
            </button>
            <button 
              type="submit" 
              className="clients-btn clients-btn-primary"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <FiLoader className="icon-spin" /> Adding...
                </>
              ) : (
                <>
                  <FiUserPlus /> Add Client
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Modify Client Modal Component
function ModifyClientModal({ show, client, onClose, onSubmit, isLoading, error }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [formErrors, setFormErrors] = useState({});

  // Set form data when client changes
  useEffect(() => {
    if (client) {
      setName(client.name || '');
      setEmail(client.email || '');
    }
  }, [client]);

  // Reset form when modal closes
  useEffect(() => {
    if (!show) {
      setName('');
      setEmail('');
      setFormErrors({});
    }
  }, [show]);

  const validate = () => {
    const errors = {};
    
    if (!name.trim()) errors.name = 'Name is required';
    if (!email.trim()) errors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(email)) errors.email = 'Email is invalid';
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (validate()) {
      onSubmit({ name, email }); 
    }
  };

  if (!show) return null;

  return (
    <div className="modal-overlay">
      <div className="modal">
        <div className="modal-header">
          <h3 className="modal-title">Modify Client</h3>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="form-group">
              <label htmlFor="name" className="form-label">Name</label>
              <input
                id="name"
                type="text"
                className="form-control"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter full name"
                autoComplete="off"
              />
              {formErrors.name && <div className="form-error">{formErrors.name}</div>}
            </div>
            
            <div className="form-group">
              <label htmlFor="email" className="form-label">Email</label>
              <input
                id="email"
                type="email"
                className="form-control"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter email address"
                autoComplete="off"
              />
              {formErrors.email && <div className="form-error">{formErrors.email}</div>}
            </div>
            
            {error && <div className="form-error">{error}</div>}
          </div>
          
          <div className="modal-actions">
            <button 
              type="button" 
              className="clients-btn clients-btn-outline" 
              onClick={onClose}
              disabled={isLoading}
            >
              <FiX /> Cancel
            </button>
            <button 
              type="submit" 
              className="clients-btn clients-btn-primary"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <FiLoader className="icon-spin" /> Updating...
                </>
              ) : (
                <>
                  <FiEdit2 /> Update Client
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
function EmptyState({ isLoading, isFiltered, statusFilter, accountantFilter, accountants }) {
  if (isLoading) {
    return (
      <div className="clients-loading">
        <div className="clients-loading-spinner"></div>
        <p>Loading clients...</p>
      </div>
    );
  }

  // Get accountant name for display in empty state
  const getAccountantName = () => {
    if (accountantFilter === 'all') return null;
    const accountant = accountants.find(a => a._id === accountantFilter);
    return accountant ? accountant.name : "Selected accountant";
  };
  
  return (
    <div className="clients-empty">
      {isFiltered ? (
        <>
          <FiSearch />
          <p>No clients match your search criteria.</p>
        </>
      ) : statusFilter !== 'all' && accountantFilter !== 'all' ? (
        <>
          <FiUsers />
          <p>No clients with "{statusFilter}" status assigned to {getAccountantName()}.</p>
        </>
      ) : statusFilter !== 'all' ? (
        <>
          <FiUsers />
          <p>No clients with "{statusFilter}" status found.</p>
        </>
      ) : accountantFilter !== 'all' ? (
        <>
          <FiUsers />
          <p>No clients assigned to {getAccountantName()}.</p>
        </>
      ) : (
        <>
          <FiUsers />
          <p>No clients have been added yet.</p>
        </>
      )}
    </div>
  );
}

// Main ClientsAccountant Component
export default function ClientsAdmin() {
  const [clients, setClients] = useState([]);
  const [filteredClients, setFilteredClients] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all'); // 'all', 'accepted', 'rejected', 'pending'
  const [accountantFilter, setAccountantFilter] = useState('all');
  const [accountants, setAccountants] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [isAddingClient, setIsAddingClient] = useState(false);
  const [isModifyModalOpen, setIsModifyModalOpen] = useState(false);
  const [isModifyingClient, setIsModifyingClient] = useState(false);
  const [selectedClient, setSelectedClient] = useState(null);
  const [confirmModal, setConfirmModal] = useState({
    show: false,
    title: '',
    message: '',
    action: null,
    data: null,
    isDestructive: false
  });

  // Fetch accountants on initial load
  useEffect(() => {
    fetchClients();
    fetchAccountants();
  }, []);

  // Filter clients when search term or filters change
  useEffect(() => {
    let filtered = [...clients];
    
    // Apply status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(client => client.status === statusFilter);
    }
    
    // Apply accountant filter
    if (accountantFilter !== 'all') {
      filtered = filtered.filter(client => client.accountantId === accountantFilter);
    }
    
    // Apply search filter
    if (searchTerm.trim() !== '') {
      const search = searchTerm.toLowerCase();
      filtered = filtered.filter(client => 
        client.name.toLowerCase().includes(search) || 
        client.email.toLowerCase().includes(search)
      );
    }
    
    setFilteredClients(filtered);
  }, [searchTerm, statusFilter, accountantFilter, clients]);

  // Fetch clients from API
  const fetchClients = async () => {
    setIsLoading(true);
    setError('');
    
    try {
      const data = await getAllClients(searchTerm);
      setClients(data);
      setFilteredClients(data);
    } catch (err) {
      setError(err.message || 'Failed to fetch clients');
      console.error('Error fetching clients:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch accountants for filter dropdown
  const fetchAccountants = async () => {
    try {
      const data = await getAccountants();
      setAccountants(data);
    } catch (err) {
      console.error('Error fetching accountants:', err);
    }
  };

  // Handle modify client form submission
  const handleModifyClient = async (clientData) => {
    setIsModifyingClient(true);
    setError('');
    
    try {
      await modifyClient(selectedClient._id, clientData);
      await fetchClients();
      setIsModifyModalOpen(false);
    } catch (err) {
      setError(err.message || 'Failed to modify client');
      console.error('Error modifying client:', err);
    } finally {
      setIsModifyingClient(false);
    }
  };

  // Open confirmation modal for actions
  const openConfirmModal = (action, id) => {
    let modalConfig = {
      show: true,
      data: id,
      action,
      isDestructive: false
    };
    
    switch (action) {
      case 'accept':
        modalConfig.title = 'Accept Client';
        modalConfig.message = 'Are you sure you want to accept this client? They will regain access to the system.';
        modalConfig.confirmText = 'Accept';
        break;
      case 'reject':
        modalConfig.title = 'Reject Client';
        modalConfig.message = 'Are you sure you want to reject this client? They will lose access to the system.';
        modalConfig.isDestructive = true;
        modalConfig.confirmText = 'Reject';
        break;
      case 'delete':
        modalConfig.title = 'Delete Client';
        modalConfig.message = 'Are you sure you want to delete this client? This action cannot be undone.';
        modalConfig.isDestructive = true;
        modalConfig.confirmText = 'Delete';
        break;
      default:
        return;
    }
    
    setConfirmModal(modalConfig);
  };

  // Handle confirmation modal actions
  const handleConfirmAction = async () => {
    setError('');
    
    try {
      const { action, data: id } = confirmModal;
      
      switch (action) {
        case 'accept':
          await acceptClient(id);
          break;
        case 'reject':
          await rejectClient(id);
          break;
        case 'delete':
          await deleteClient(id);
          break;
        default:
          break;
      }
      
      await fetchClients();
    } catch (err) {
      setError(err.message || `Failed to ${confirmModal.action} client`);
      console.error(`Error during ${confirmModal.action}:`, err);
    } finally {
      setConfirmModal({ ...confirmModal, show: false });
    }
  };

  return (
    <div className="accountants-admin">
      {/* Modify Client Modal */}
      <ModifyClientModal 
        show={isModifyModalOpen}
        client={selectedClient}
        onClose={() => setIsModifyModalOpen(false)}
        onSubmit={handleModifyClient}
        isLoading={isModifyingClient}
        error={error}
      />
      
      {/* Confirmation Modal */}
      <ConfirmModal 
        {...confirmModal}
        onConfirm={handleConfirmAction}
        onCancel={() => setConfirmModal({ ...confirmModal, show: false })}
      />
      
      <div className="clients-container">
        {error && <div className="clients-error">{error}</div>}
        
        <div className="clients-actions">
          <div className="clients-search-container">
            <span className="clients-search-icon">
              <FiSearch />
            </span>
            <input
              type="text"
              className="clients-search"
              placeholder="Search clients by name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              aria-label="Search clients"
            />
          </div>
          
          <div className="clients-filter-container">
            <div className="clients-filter-buttons">
              <button 
                className={`clients-filter-btn ${statusFilter === 'all' ? 'active' : ''}`}
                onClick={() => setStatusFilter('all')}
              >
                All
              </button>
              <button 
                className={`clients-filter-btn ${statusFilter === 'accepted' ? 'active' : ''}`}
                onClick={() => setStatusFilter('accepted')}
              >
                <FiCheck className="filter-icon" /> Accepted
              </button>
              <button 
                className={`clients-filter-btn ${statusFilter === 'pending' ? 'active' : ''}`}
                onClick={() => setStatusFilter('pending')}
              >
                <FiClock className="filter-icon" /> Pending
              </button>
              <button 
                className={`clients-filter-btn ${statusFilter === 'rejected' ? 'active' : ''}`}
                onClick={() => setStatusFilter('rejected')}
              >
                <FiX className="filter-icon" /> Rejected
              </button>
            </div>
            
            <div className="clients-accountant-filter">
              <label htmlFor="accountant-filter" className="accountant-filter-label">
                <FiFilter /> Accountant:
              </label>
              <select 
                id="accountant-filter"
                className="accountant-filter-select"
                value={accountantFilter}
                onChange={(e) => setAccountantFilter(e.target.value)}
              >
                <option value="all">All Accountants</option>
                {accountants.map(accountant => (
                  <option 
                    key={accountant._id} 
                    value={accountant._id}
                  >
                    {accountant.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
        
        <div className="clients-table-container">
          {filteredClients.length === 0 ? (
            <EmptyState 
              isLoading={isLoading} 
              isFiltered={searchTerm.trim() !== ''}
              statusFilter={statusFilter}
              accountantFilter={accountantFilter}
              accountants={accountants}
            />
          ) : (
            <table className="clients-table">
              <thead>
                <tr>
                  <th>NAME</th>
                  <th>EMAIL</th>
                  <th>STATUS</th>
                  <th>ACCOUNTANT</th>
                  <th>ACTIONS</th>
                </tr>
              </thead>
              <tbody>
                {filteredClients.map((client) => (
                  <tr key={client._id}>
                    <td className="clients-name">{client.name}</td>
                    <td className="clients-email">{client.email}</td>
                    <td>
                      <span className={`clients-status ${
                        client.status === 'accepted' 
                          ? 'clients-status-active'
                          : client.status === 'rejected'
                            ? 'clients-status-inactive' 
                            : 'clients-status-pending'
                      }`}>
                        {client.status === 'accepted' ? (
                          <>
                            <FiCheck /> Accepted
                          </>
                        ) : client.status === 'rejected' ? (
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
                    <td className="clients-accountant">
                      <FiUser /> {client.accountantName || client.accountantId}
                    </td>
                    <td className="clients-actions-cell">

                      {client.status === 'rejected' ? (
                        <button 
                          className="clients-action-btn clients-action-btn-green"
                          onClick={() => openConfirmModal('accept', client._id)}
                          aria-label="Accept client"
                          title="Accept client"
                        >
                          <FiCheck />
                        </button>
                      ) : client.status === 'pending' ? (
                        <>
                          <button 
                            className="clients-action-btn clients-action-btn-green"
                            onClick={() => openConfirmModal('accept', client._id)}
                            aria-label="Accept client"
                            title="Accept client"
                          >
                            <FiCheck />
                          </button>
                          <button 
                            className="clients-action-btn clients-action-btn-yellow"
                            onClick={() => openConfirmModal('reject', client._id)}
                            aria-label="Reject client"
                            title="Reject client"
                          >
                            <FiUserX />
                          </button>
                        </>
                      ) : (
                        <button 
                          className="clients-action-btn clients-action-btn-yellow"
                          onClick={() => openConfirmModal('reject', client._id)}
                          aria-label="Reject client"
                          title="Reject client"
                        >
                          <FiUserX />
                        </button>
                      )}
                      
                      <button 
                        className="clients-action-btn clients-action-btn-blue"
                        onClick={() => {
                          setSelectedClient(client);
                          setIsModifyModalOpen(true);
                        }}
                        aria-label="Modify client"
                        title="Modify client"
                      >
                        <FiEdit2 />
                      </button>

                      <button 
                        className="clients-action-btn clients-action-btn-red"
                        onClick={() => openConfirmModal('delete', client._id)}
                        aria-label="Delete client"
                        title="Delete client"
                      >
                        <FiTrash2 />
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