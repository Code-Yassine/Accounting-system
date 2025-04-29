import React, { useState, useEffect } from 'react';
import './AccountantsAdmin.css';
import {
  getAccountants,
  addAccountant,
  modifyAccountant,
  activateAccountant,
  deactivateAccountant,
  deleteAccountant
} from '../../api/accountants';
import { 
  FiSearch, 
  FiUserPlus, 
  FiCheck, 
  FiX, 
  FiTrash2, 
  FiUserX, 
  FiUser, 
  FiUsers,
  FiAlertTriangle,
  FiLoader,
  FiEdit2
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

// Add Accountant Modal Component
function AddAccountantModal({ show, onClose, onSubmit, isLoading, error }) {
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
          <h3 className="modal-title">Add New Accountant</h3>
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
              className="accountants-btn accountants-btn-outline" 
              onClick={onClose}
              disabled={isLoading}
            >
              <FiX /> Cancel
            </button>
            <button 
              type="submit" 
              className="accountants-btn accountants-btn-primary"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <FiLoader className="icon-spin" /> Adding...
                </>
              ) : (
                <>
                  <FiUserPlus /> Add Accountant
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Modify Accountant Modal Component
function ModifyAccountantModal({ show, accountant, onClose, onSubmit, isLoading, error }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [formErrors, setFormErrors] = useState({});

  // Reset form when modal closes or accountant changes
  useEffect(() => {
    if (!show) {
      resetForm();
    } else if (accountant) {
      setName(accountant.name || '');
      setEmail(accountant.email || '');
      setPassword('');
      setConfirmPassword('');
    }
  }, [show, accountant]);

  const resetForm = () => {
    setName('');
    setEmail('');
    setPassword('');
    setConfirmPassword('');
    setFormErrors({});
  };

  const validate = () => {
    const errors = {};
    
    if (!name.trim()) errors.name = 'Name is required';
    if (!email.trim()) errors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(email)) errors.email = 'Email is invalid';
    
    // Password is optional for modification, but if provided, it must be valid
    if (password) {
      if (password.length < 6) errors.password = 'Password must be at least 6 characters';
      if (password !== confirmPassword) errors.confirmPassword = 'Passwords do not match';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (validate()) {
      const data = { name, email };
      if (password) data.password = password;
      
      onSubmit(accountant._id, data);
    }
  };

  if (!show) return null;

  return (
    <div className="modal-overlay">
      <div className="modal">
        <div className="modal-header">
          <h3 className="modal-title">Modify Accountant</h3>
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
              <label htmlFor="password" className="form-label">Password (leave blank to keep current)</label>
              <input
                id="password"
                type="password"
                className="form-control"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter new password"
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
                placeholder="Confirm new password"
                autoComplete="new-password"
                disabled={!password}
              />
              {formErrors.confirmPassword && <div className="form-error">{formErrors.confirmPassword}</div>}
            </div>
            
            {error && <div className="form-error">{error}</div>}
          </div>
          
          <div className="modal-actions">
            <button 
              type="button" 
              className="accountants-btn accountants-btn-outline" 
              onClick={onClose}
              disabled={isLoading}
            >
              <FiX /> Cancel
            </button>
            <button 
              type="submit" 
              className="accountants-btn accountants-btn-primary"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <FiLoader className="icon-spin" /> Saving...
                </>
              ) : (
                <>
                  <FiCheck /> Save Changes
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
      <div className="accountants-loading">
        <div className="accountants-loading-spinner"></div>
        <p>Loading accountants...</p>
      </div>
    );
  }
  
  return (
    <div className="accountants-empty">
      {isFiltered ? (
        <>
          <FiSearch />
          {statusFilter !== 'all' ? (
            <p>No {statusFilter} accountants found.</p>
          ) : (
            <p>No accountants match your search criteria.</p>
          )}
        </>
      ) : (
        <>
          <FiUsers />
          <p>No accountants have been added yet.</p>
        </>
      )}
    </div>
  );
}

// Main AccountantsAdmin Component
export default function AccountantsAdmin() {
  const [accountants, setAccountants] = useState([]);
  const [filteredAccountants, setFilteredAccountants] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all'); // 'all', 'active', 'inactive'
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isAddingAccountant, setIsAddingAccountant] = useState(false);
  const [isModifyModalOpen, setIsModifyModalOpen] = useState(false);
  const [isModifyingAccountant, setIsModifyingAccountant] = useState(false);
  const [selectedAccountant, setSelectedAccountant] = useState(null);
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
    fetchAccountants();
  }, []);

  // Filter accountants when search term or status filter changes
  useEffect(() => {
    let filtered = [...accountants];
    
    // Apply status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(accountant => accountant.status === statusFilter);
    }
    
    // Apply search filter
    if (searchTerm.trim() !== '') {
      const search = searchTerm.toLowerCase();
      filtered = filtered.filter(accountant => 
        accountant.name.toLowerCase().includes(search) || 
        accountant.email.toLowerCase().includes(search)
      );
    }
    
    setFilteredAccountants(filtered);
  }, [searchTerm, statusFilter, accountants]);

  // Fetch accountants from API
  const fetchAccountants = async () => {
    setIsLoading(true);
    setError('');
    
    try {
      const data = await getAccountants();
      setAccountants(data);
      setFilteredAccountants(data);
    } catch (err) {
      setError(err.message || 'Failed to fetch accountants');
      console.error('Error fetching accountants:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle add accountant form submission
  const handleAddAccountant = async (accountantData) => {
    setIsAddingAccountant(true);
    setError('');
    
    try {
      await addAccountant(accountantData);
      await fetchAccountants();
      setIsAddModalOpen(false);
    } catch (err) {
      setError(err.message || 'Failed to add accountant');
      console.error('Error adding accountant:', err);
    } finally {
      setIsAddingAccountant(false);
    }
  };

  // Handle modify accountant form submission
  const handleModifyAccountant = async (id, accountantData) => {
    setIsModifyingAccountant(true);
    setError('');
    
    try {
      await modifyAccountant(id, accountantData);
      await fetchAccountants();
      setIsModifyModalOpen(false);
    } catch (err) {
      setError(err.message || 'Failed to modify accountant');
      console.error('Error modifying accountant:', err);
    } finally {
      setIsModifyingAccountant(false);
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
      case 'activate':
        modalConfig.title = 'Activate Accountant';
        modalConfig.message = 'Are you sure you want to activate this accountant? They will regain access to the system.';
        modalConfig.confirmText = 'Activate';
        break;
      case 'deactivate':
        modalConfig.title = 'Deactivate Accountant';
        modalConfig.message = 'Are you sure you want to deactivate this accountant? They will lose access to the system.';
        modalConfig.isDestructive = true;
        modalConfig.confirmText = 'Deactivate';
        break;
      case 'delete':
        modalConfig.title = 'Delete Accountant';
        modalConfig.message = 'Are you sure you want to delete this accountant? This action cannot be undone.';
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
        case 'activate':
          await activateAccountant(id);
          break;
        case 'deactivate':
          await deactivateAccountant(id);
          break;
        case 'delete':
          await deleteAccountant(id);
          break;
        default:
          break;
      }
      
      await fetchAccountants();
    } catch (err) {
      setError(err.message || `Failed to ${confirmModal.action} accountant`);
      console.error(`Error during ${confirmModal.action}:`, err);
    } finally {
      setConfirmModal({ ...confirmModal, show: false });
    }
  };

  return (
    <div className="accountants-admin">
      {/* Add Accountant Modal */}
      <AddAccountantModal 
        show={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSubmit={handleAddAccountant}
        isLoading={isAddingAccountant}
        error={error}
      />
      
      {/* Modify Accountant Modal */}
      <ModifyAccountantModal
        show={isModifyModalOpen}
        accountant={selectedAccountant}
        onClose={() => setIsModifyModalOpen(false)}
        onSubmit={handleModifyAccountant}
        isLoading={isModifyingAccountant}
        error={error}
      />
      
      {/* Confirmation Modal */}
      <ConfirmModal 
        {...confirmModal}
        onConfirm={handleConfirmAction}
        onCancel={() => setConfirmModal({ ...confirmModal, show: false })}
      />
      
      <div className="accountants-container">
        {error && <div className="accountants-error">{error}</div>}
        
        <div className="accountants-actions">
          <div className="accountants-search-container">
            <span className="accountants-search-icon">
              <FiSearch />
            </span>
            <input
              type="text"
              className="accountants-search"
              placeholder="Search accountants by name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              aria-label="Search accountants"
            />
          </div>
          
          <div className="accountants-filter-container">
            <div className="accountants-filter-buttons">
              <button 
                className={`accountants-filter-btn ${statusFilter === 'all' ? 'active' : ''}`}
                onClick={() => setStatusFilter('all')}
              >
                All
              </button>
              <button 
                className={`accountants-filter-btn ${statusFilter === 'active' ? 'active' : ''}`}
                onClick={() => setStatusFilter('active')}
              >
                <FiCheck className="filter-icon" /> Active
              </button>
              <button 
                className={`accountants-filter-btn ${statusFilter === 'inactive' ? 'active' : ''}`}
                onClick={() => setStatusFilter('inactive')}
              >
                <FiX className="filter-icon" /> Inactive
              </button>
            </div>
          </div>
          
          <button 
            className="accountants-btn accountants-btn-primary"
            onClick={() => setIsAddModalOpen(true)}
          >
            <FiUserPlus /> Add Accountant
          </button>
        </div>
        
        <div className="accountants-table-container">
          {filteredAccountants.length === 0 ? (
            <EmptyState 
              isLoading={isLoading} 
              isFiltered={searchTerm.trim() !== '' || statusFilter !== 'all'}
              statusFilter={statusFilter}
            />
          ) : (
            <table className="accountants-table">
              <thead>
                <tr>
                  <th>NAME</th>
                  <th>EMAIL</th>
                  <th>STATUS</th>
                  <th>ACTIONS</th>
                </tr>
              </thead>
              <tbody>
                {filteredAccountants.map((accountant) => (
                  <tr key={accountant._id}>
                    <td className="accountants-name">{accountant.name}</td>
                    <td className="accountants-email">{accountant.email}</td>
                    <td>
                      <span className={`accountants-status ${
                        accountant.status === 'active' 
                          ? 'accountants-status-active' 
                          : 'accountants-status-inactive'
                      }`}>
                        {accountant.status === 'active' ? (
                          <>
                            <FiCheck /> Active
                          </>
                        ) : (
                          <>
                            <FiX /> Inactive
                          </>
                        )}
                      </span>
                    </td>
                    <td className="accountants-actions-cell">
                      {accountant.status === 'inactive' ? (
                        <button 
                          className="accountants-action-btn accountants-action-btn-green"
                          onClick={() => openConfirmModal('activate', accountant._id)}
                          aria-label="Activate accountant"
                          title="Activate accountant"
                        >
                          <FiCheck />
                        </button>
                      ) : (
                        <button 
                          className="accountants-action-btn accountants-action-btn-yellow"
                          onClick={() => openConfirmModal('deactivate', accountant._id)}
                          aria-label="Deactivate accountant"
                          title="Deactivate accountant"
                        >
                          <FiUserX />
                        </button>
                      )}
                      <button 
                        className="accountants-action-btn accountants-action-btn-blue"
                        onClick={() => {
                          setSelectedAccountant(accountant);
                          setIsModifyModalOpen(true);
                        }}
                        aria-label="Modify accountant"
                        title="Modify accountant"
                      >
                        <FiEdit2 />
                      </button>
                      <button 
                        className="accountants-action-btn accountants-action-btn-red"
                        onClick={() => openConfirmModal('delete', accountant._id)}
                        aria-label="Delete accountant"
                        title="Delete accountant"
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