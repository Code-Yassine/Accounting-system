import React, { useState, useRef, useEffect } from 'react';
import './AdminDashboard.css';
import AccountantsAdmin from '../AccountantsAdmin/AccountantsAdmin';
import ClientsAdmin from '../ClientsAdmin/ClientsAdmin';
import RequestsAdmin from '../RequestsAdmin/RequestsAdmin';
import { FiHome, FiUsers, FiBriefcase, FiLogOut, FiMenu, FiX, FiCheck, FiClock, FiUserCheck, FiUserX, FiInbox } from 'react-icons/fi';
import { getAccountants } from '../../api/accountants';
import { getAllClients } from '../../api/clients';

export default function AdminDashboard({ onSignOut }) {
  const [page, setPage] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const profileRef = useRef(null);
  const [admin, setAdmin] = useState(null);
  const [statistics, setStatistics] = useState({
    totalAccountants: 0,
    activeAccountants: 0,
    inactiveAccountants: 0,
    totalClients: 0,
    pendingClients: 0,
    acceptedClients: 0,
    rejectedClients: 0
  });
  const [isLoading, setIsLoading] = useState(true);

  // Load admin info on component mount
  useEffect(() => {
    const loadAdminInfo = () => {
      // Try to get admin info from different possible storage locations
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

  // Load statistics when dashboard is shown
  useEffect(() => {
    if (page === 'dashboard') {
      loadStatistics();
    }
  }, [page]);

  // Load statistics
  const loadStatistics = async () => {
    setIsLoading(true);
    try {
      // Fetch accountants and clients data
      const accountantsData = await getAccountants();
      const clientsData = await getAllClients();
      
      // Calculate statistics
      const activeAccountants = accountantsData.filter(acc => acc.status === 'active').length;
      const pendingClients = clientsData.filter(client => client.status === 'pending').length;
      const acceptedClients = clientsData.filter(client => client.status === 'accepted').length;
      const rejectedClients = clientsData.filter(client => client.status === 'rejected').length;
      
      setStatistics({
        totalAccountants: accountantsData.length,
        activeAccountants: activeAccountants,
        inactiveAccountants: accountantsData.length - activeAccountants,
        totalClients: clientsData.length,
        pendingClients: pendingClients,
        acceptedClients: acceptedClients,
        rejectedClients: rejectedClients
      });
    } catch (error) {
      console.error('Error loading statistics:', error);
    } finally {
      setIsLoading(false);
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
          <a 
            className={page === 'requests' ? 'active' : ''}
            href="#requests"
            onClick={(e) => { e.preventDefault(); handlePageChange('requests'); }}
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
            {page === 'accountants' && 'Manage Accountants'}
            {page === 'clients' && 'Manage Clients'}
            {page === 'requests' && 'Manage Requests'}
          </h1>
          <div className="admin-dashboard-user" ref={profileRef} onClick={() => setProfileOpen((open) => !open)} style={{ position: 'relative', cursor: 'pointer' }}>
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
              </div>
            )}
          </div>
        </header>
        
        <section className="admin-dashboard-content">
          {page === 'dashboard' && (
            <div className="dashboard-container">
              <h2 className="dashboard-section-title">Welcome, {admin?.name || 'Administrator'}</h2>
              
              {isLoading ? (
                <div className="dashboard-loading">
                  <div className="dashboard-loading-spinner"></div>
                  <p>Loading dashboard data...</p>
                </div>
              ) : (
                <>
                  <div className="dashboard-stats-grid">
                    {/* Accountants Stats */}
                    <div className="dashboard-stat-card">
                      <div className="stat-icon accountant-icon">
                        <FiUsers />
                      </div>
                      <div className="stat-content">
                        <h3>Total Accountants</h3>
                        <div className="stat-number">{statistics.totalAccountants}</div>
                        <div className="stat-details">
                          <div className="stat-detail">
                            <FiUserCheck className="detail-icon active" /> {statistics.activeAccountants} Active
                          </div>
                          <div className="stat-detail">
                            <FiUserX className="detail-icon inactive" /> {statistics.inactiveAccountants} Inactive
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Clients Stats */}
                    <div className="dashboard-stat-card">
                      <div className="stat-icon client-icon">
                        <FiBriefcase />
                      </div>
                      <div className="stat-content">
                        <h3>Total Clients</h3>
                        <div className="stat-number">{statistics.totalClients}</div>
                        <div className="stat-details">
                          <div className="stat-detail">
                            <FiCheck className="detail-icon active" /> {statistics.acceptedClients} Accepted
                          </div>
                          <div className="stat-detail">
                            <FiClock className="detail-icon pending" /> {statistics.pendingClients} Pending
                          </div>
                          <div className="stat-detail">
                            <FiX className="detail-icon inactive" /> {statistics.rejectedClients} Rejected
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="dashboard-actions">
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
                </>
              )}
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