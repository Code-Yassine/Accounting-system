import React, { useState, useRef, useEffect } from 'react';
import './AdminDashboard.css';
import AccountantsAdmin from '../AccountantsAdmin/AccountantsAdmin';
import ClientsAdmin from '../ClientsAdmin/ClientsAdmin';
import RequestsAdmin from '../RequestsAdmin/RequestsAdmin';
import { FiHome, FiUsers, FiBriefcase, FiLogOut, FiMenu, FiX, FiInbox, FiFile } from 'react-icons/fi';

export default function AdminDashboard({ onSignOut }) {
  const [page, setPage] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const profileRef = useRef(null);
  const [admin, setAdmin] = useState(null);

  // Load admin info on component mount
  useEffect(() => {
    const loadAdminInfo = () => {
      const adminData = 
        JSON.parse(localStorage.getItem('admin')) || 
        JSON.parse(localStorage.getItem('user')) || 
        JSON.parse(localStorage.getItem('userData')) ||
        JSON.parse(sessionStorage.getItem('user'));
      if (adminData) {
        setAdmin(adminData);
      }
    };
    loadAdminInfo();
  }, []);

  // Get admin initials for the avatar
  const getInitials = () => {
    if (!admin || !admin.name) return 'AU';
    const names = admin.name.split(' ');
    if (names.length >= 2) {
      return `${names[0][0]}${names[1][0]}`.toUpperCase();
    }
    return admin.name.substring(0, 2).toUpperCase();
  };

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const handlePageChange = (newPage) => {
    setPage(newPage);
    if (window.innerWidth <= 768) {
      setSidebarOpen(false);
    }
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setProfileOpen(false);
      }
    }
    if (profileOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [profileOpen]);

  return (
    <div className="admin-dashboard-bg">
      <button className="hamburger-menu" onClick={toggleSidebar}>
        {sidebarOpen ? <FiX /> : <FiMenu />}
      </button>
      <aside className={`admin-dashboard-sidebar ${sidebarOpen ? 'active' : ''}`}>
        <div className="admin-dashboard-logo">Clever Office</div>
        <nav className="admin-dashboard-nav">
          <a 
            className={page === 'dashboard' ? 'active' : ''}
            href="#dashboard"
            onClick={e => { e.preventDefault(); handlePageChange('dashboard'); }}
          >
            <FiHome className="sidebar-icon" /> <span>Dashboard</span>
          </a>
          <a 
            className={page === 'accountants' ? 'active' : ''}
            href="#accountants"
            onClick={e => { e.preventDefault(); handlePageChange('accountants'); }}
          >
            <FiUsers className="sidebar-icon" /> <span>Accountants</span>
          </a>
          <a 
            className={page === 'clients' ? 'active' : ''}
            href="#clients"
            onClick={e => { e.preventDefault(); handlePageChange('clients'); }}
          >
            <FiBriefcase className="sidebar-icon" /> <span>Clients</span>
          </a>
          <a 
            className={page === 'requests' ? 'active' : ''}
            href="#requests"
            onClick={e => { e.preventDefault(); handlePageChange('requests'); }}
          >
            <FiInbox className="sidebar-icon" /> <span>Requests</span>
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
            {page === 'accountants' && 'Accountant Management'}
            {page === 'clients' && 'Client Management'}
            {page === 'requests' && 'Requests Management'}
          </h1>
          <div className="admin-dashboard-user" ref={profileRef} onClick={() => setProfileOpen(open => !open)} style={{ position: 'relative', cursor: 'pointer' }}>
            <div className="admin-dashboard-user-avatar">{getInitials()}</div>
            <span className="admin-dashboard-user-name">{admin?.name || 'Admin User'}</span>
            {profileOpen && (
              <div className="admin-dashboard-profile-dropdown">
                <div className="admin-dashboard-profile-info">
                  <div className="admin-dashboard-profile-avatar">{getInitials()}</div>
                  <div>
                    <div className="admin-dashboard-profile-name">{admin?.name || 'Admin User'}</div>
                    <div className="admin-dashboard-profile-email">{admin?.email || 'admin@finbooks.com'}</div>
                    <div className="admin-dashboard-profile-status">
                      Role: <span className="profile-status-label">Administrator</span>
                    </div>
                  </div>
                </div>
                <div className="admin-dashboard-profile-actions">
                  <button 
                    className="admin-dashboard-profile-signout"
                    onClick={onSignOut}
                  >
                    <FiLogOut /> Sign out
                  </button>
                </div>
              </div>
            )}
          </div>
        </header>
        <section className="admin-dashboard-content">
          {page === 'dashboard' && (
            <div className="empty-dashboard">
              <div className="empty-dashboard-title">Welcome, {admin?.name || 'Admin User'}</div>
              <p className="empty-dashboard-description">
                Manage your accountants, clients, and requests efficiently from this dashboard. 
                Use the navigation menu to access different sections of the admin panel.
              </p>
              <div className="empty-dashboard-actions">
                <button 
                  className="accountants-btn accountants-btn-primary"
                  onClick={() => handlePageChange('accountants')}
                >
                  <FiUsers /> Manage accountants
                </button>
                <button 
                  className="accountants-btn accountants-btn-primary"
                  onClick={() => handlePageChange('clients')}
                >
                  <FiBriefcase /> Manage clients
                </button>
                <button 
                  className="accountants-btn accountants-btn-primary"
                  onClick={() => handlePageChange('requests')}
                >
                  <FiFile /> Manage requests
                </button>
              </div>
            </div>
          )}
          {page === 'accountants' && <AccountantsAdmin />}
          {page === 'clients' && <ClientsAdmin />}
          {page === 'requests' && <RequestsAdmin />}
        </section>
      </main>
    </div>
  );
}