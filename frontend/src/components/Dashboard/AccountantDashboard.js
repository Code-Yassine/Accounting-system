import React, { useState, useRef, useEffect } from 'react';
import './AccountantDashboard.css';
import ClientsAccountant from '../ClientsAccountant/ClientsAccountant';
import { FiHome, FiUsers, FiLogOut, FiMenu, FiX } from 'react-icons/fi';

export default function AccountantDashboard({ onSignOut }) {
  const [page, setPage] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const profileRef = useRef(null);

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
            className={page === 'clients' ? 'active' : ''}
            href="#clients"
            onClick={(e) => { e.preventDefault(); handlePageChange('clients'); }}
          >
            <FiUsers className="sidebar-icon" /> <span>Clients</span>
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
            {page === 'clients' && 'Client Management'}
          </h1>
          <div className="admin-dashboard-user" ref={profileRef} onClick={() => setProfileOpen((open) => !open)} style={{ position: 'relative', cursor: 'pointer' }}>
            <div className="admin-dashboard-user-avatar">AC</div>
            <span className="admin-dashboard-user-name">Accountant</span>
            {profileOpen && (
              <div className="admin-dashboard-profile-dropdown">
                <div className="admin-dashboard-profile-info">
                  <div className="admin-dashboard-profile-avatar">AC</div>
                  <div>
                    <div className="admin-dashboard-profile-name">Accountant</div>
                    <div className="admin-dashboard-profile-email">accountant@finbooks.com</div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </header>
        
        <section className="admin-dashboard-content">
          {page === 'dashboard' && (
            <div className="dashboard-stat-grid">
              <div className="dashboard-stat-card">
                <div className="dashboard-stat-title">Total Clients</div>
                <div className="dashboard-stat-value">24</div>
                <div className="dashboard-stat-change dashboard-stat-change-positive">+3 this month</div>
              </div>
              <div className="dashboard-stat-card">
                <div className="dashboard-stat-title">Active Projects</div>
                <div className="dashboard-stat-value">15</div>
                <div className="dashboard-stat-change">In Progress</div>
              </div>
              <div className="dashboard-stat-card">
                <div className="dashboard-stat-title">Monthly Revenue</div>
                <div className="dashboard-stat-value">$12,450</div>
                <div className="dashboard-stat-change dashboard-stat-change-positive">+8.3%</div>
              </div>
            </div>
          )}
          
          {page === 'clients' && <ClientsAccountant />}
        </section>
      </main>
    </div>
  );
} 