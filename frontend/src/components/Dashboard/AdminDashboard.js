import React, { useState } from 'react';
import './AdminDashboard.css';
import AccountantsAdmin from './AccountantsAdmin';
import { FiHome, FiUsers, FiBriefcase, FiLogOut, FiMenu, FiX } from 'react-icons/fi';

export default function AdminDashboard({ onSignOut }) {
  const [page, setPage] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const handlePageChange = (newPage) => {
    setPage(newPage);
    if (window.innerWidth <= 768) {
      setSidebarOpen(false);
    }
  };

  return (
    <div className="admin-dashboard-bg">
      <button className="hamburger-menu" onClick={toggleSidebar}>
        {sidebarOpen ? <FiX /> : <FiMenu />}
      </button>
      
      <aside className={`admin-dashboard-sidebar ${sidebarOpen ? 'active' : ''}`}>
        <div className="admin-dashboard-logo">FinBooks</div>
        
        <nav className="admin-dashboard-nav">
          <a 
            className={page === 'dashboard' ? 'active' : ''}
            href="#dashboard"
            onClick={(e) => { e.preventDefault(); handlePageChange('dashboard'); }}
          >
            <FiHome className="sidebar-icon" /> <span>Dashboard</span>
          </a>
          <a 
            className={page === 'accountants' ? 'active' : ''}
            href="#accountants"
            onClick={(e) => { e.preventDefault(); handlePageChange('accountants'); }}
          >
            <FiUsers className="sidebar-icon" /> <span>Accountants</span>
          </a>
          <a 
            className={page === 'clients' ? 'active' : ''}
            href="#clients"
            onClick={(e) => { e.preventDefault(); handlePageChange('clients'); }}
          >
            <FiBriefcase className="sidebar-icon" /> <span>Clients</span>
          </a>
        </nav>
        
        <button className="admin-dashboard-signout" onClick={onSignOut}>
          <FiLogOut /> <span>Sign out</span>
        </button>
      </aside>
      
      <main className="admin-dashboard-main">
        <header className="admin-dashboard-header">
          <h1>
            {page === 'dashboard' && 'Dashboard'}
            {page === 'accountants' && 'Manage Accountants'}
            {page === 'clients' && 'Manage Clients'}
          </h1>
          
          <div className="admin-dashboard-user">
            <div className="admin-dashboard-user-avatar">AU</div>
            <span className="admin-dashboard-user-name">Admin User</span>
          </div>
        </header>
        
        <section className="admin-dashboard-content">
          {page === 'dashboard' && (
            <div className="empty-dashboard">
              <div className="empty-dashboard-title">Welcome to FinBooks Admin</div>
              <p className="empty-dashboard-description">
                Manage your accountants and clients efficiently from this dashboard. 
                Use the navigation menu to access different sections of the admin panel.
              </p>
              <div className="empty-dashboard-actions">
                <button 
                  className="accountants-btn accountants-btn-primary"
                  onClick={() => handlePageChange('accountants')}
                >
                  <FiUsers /> Manage Accountants
                </button>
                <button 
                  className="accountants-btn accountants-btn-outline"
                  onClick={() => handlePageChange('clients')}
                >
                  <FiBriefcase /> Manage Clients
                </button>
              </div>
            </div>
          )}
          
          {page === 'accountants' && <AccountantsAdmin />}
          
          {page === 'clients' && (
            <div className="empty-dashboard">
              <div className="empty-dashboard-title">Client Management</div>
              <p className="empty-dashboard-description">
                This feature is coming soon. You'll be able to add, edit, and manage your clients 
                from this section.
              </p>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}