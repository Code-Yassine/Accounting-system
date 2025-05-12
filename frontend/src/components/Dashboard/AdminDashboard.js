import React, { useState, useRef, useEffect } from 'react';
import './AdminDashboard.css';
import AccountantsAdmin from '../AccountantsAdmin/AccountantsAdmin';
import ClientsAdmin from '../ClientsAdmin/ClientsAdmin';
import RequestsAdmin from '../RequestsAdmin/RequestsAdmin';
import { FiHome, FiUsers, FiBriefcase, FiLogOut, FiMenu, FiX, FiCheck, FiClock, FiUserCheck, FiUserX, FiInbox, FiChevronRight } from 'react-icons/fi';
import { getAccountants } from '../../api/accountants';
import { getAllClients } from '../../api/clients';
// We'll use mock data for now instead of API calls for documents and invoices

export default function AdminDashboard({ onSignOut }) {
  const [page, setPage] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const profileRef = useRef(null);
  const [admin, setAdmin] = useState(null);
  const [statistics, setStatistics] = useState({
    totalClients: 24,
    activeClients: 20,
    pendingDocuments: 7,
    paidInvoices: 15,
    monthlyGrowth: {
      clients: 8,
      activeClients: 5,
      documents: -2,
      invoices: 12
    },
    clientGrowth: [12, 15, 18, 24, 21, 24],
    recentActivity: [
      {
        type: 'new-client',
        message: 'New client registered: Organic Harvest Farms',
        date: 'Apr 18, 2023 09:30'
      },
      {
        type: 'document-upload',
        message: 'Tech Solutions Inc. uploaded Q1 Tax Documents',
        date: 'Apr 17, 2023 14:45'
      },
      {
        type: 'new-invoice',
        message: 'New invoice created for Gourmet Delights Catering',
        date: 'Apr 15, 2023 11:20'
      },
      {
        type: 'payment',
        message: 'Payment received from Green Earth Landscaping',
        date: 'Apr 12, 2023 16:05'
      }
    ]
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
      // In a real implementation, these would be API calls
      // For now we'll keep the mock data in state
      setTimeout(() => {
        setIsLoading(false);
      }, 500);
    } catch (error) {
      console.error('Error loading statistics:', error);
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

  // Function to render activity icon based on type
  const renderActivityIcon = (type) => {
    switch (type) {
      case 'new-client':
        return <div className="activity-icon client-icon">👤</div>;
      case 'document-upload':
        return <div className="activity-icon document-icon">📄</div>;
      case 'new-invoice':
        return <div className="activity-icon invoice-icon">💼</div>;
      case 'payment':
        return <div className="activity-icon payment-icon">💰</div>;
      default:
        return <div className="activity-icon">📌</div>;
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
            {page === 'dashboard' && 'Admin Dashboard'}
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
              {page === 'dashboard' && <p className="dashboard-subtitle">Overview of accounting management system</p>}
              
              {isLoading ? (
                <div className="dashboard-loading">
                  <div className="dashboard-loading-spinner"></div>
                  <p>Loading dashboard data...</p>
                </div>
              ) : (
                <>
                  {/* Metrics Cards */}
                  <div className="metrics-grid">
                    <div className="metric-card">
                      <div className="metric-icon client-icon">👥</div>
                      <div className="metric-content">
                        <h3>Total Clients</h3>
                        <div className="metric-value">{statistics.totalClients}</div>
                        <div className="metric-trend positive">
                          +{statistics.monthlyGrowth.clients}% <span>since last month</span>
                        </div>
                      </div>
                          </div>
                    
                    <div className="metric-card">
                      <div className="metric-icon active-icon">👤</div>
                      <div className="metric-content">
                        <h3>Active Clients</h3>
                        <div className="metric-value">{statistics.activeClients}</div>
                        <div className="metric-trend positive">
                          +{statistics.monthlyGrowth.activeClients}% <span>since last month</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="metric-card">
                      <div className="metric-icon document-icon">📄</div>
                      <div className="metric-content">
                        <h3>Pending Documents</h3>
                        <div className="metric-value">{statistics.pendingDocuments}</div>
                        <div className="metric-trend negative">
                          -{statistics.monthlyGrowth.documents}% <span>since last month</span>
                        </div>
                      </div>
                          </div>
                    
                    <div className="metric-card">
                      <div className="metric-icon invoice-icon">💳</div>
                      <div className="metric-content">
                        <h3>Paid Invoices</h3>
                        <div className="metric-value">{statistics.paidInvoices}</div>
                        <div className="metric-trend positive">
                          +{statistics.monthlyGrowth.invoices}% <span>since last month</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Charts and Activity Row */}
                  <div className="dashboard-charts-activity">
                    {/* Client Growth Chart */}
                    <div className="dashboard-chart-container">
                      <div className="chart-header">
                        <h3>Client Growth</h3>
                        <div className="chart-period">Last 6 months</div>
                      </div>
                      
                      <div className="client-chart">
                        {/* In a real app, this would be a proper chart component */}
                        <div className="chart-bars">
                          {statistics.clientGrowth.map((value, index) => (
                            <div key={index} className="chart-bar-wrapper">
                              <div className="chart-bar" style={{ height: `${(value / 24) * 100}%` }}></div>
                              <div className="chart-label">{index === 0 ? 'Jan' : 
                                              index === 1 ? 'Feb' :
                                              index === 2 ? 'Mar' :
                                              index === 3 ? 'Apr' :
                                              index === 4 ? 'May' : 'Jun'}</div>
                            </div>
                          ))}
                        </div>
                        
                        <div className="chart-y-axis">
                          <div>24</div>
                          <div>21</div>
                          <div>18</div>
                          <div>15</div>
                          <div>12</div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Recent Activity */}
                    <div className="recent-activity-container">
                      <div className="activity-header">
                        <h3>Recent Activity</h3>
                        <a href="#" className="view-all">View all <FiChevronRight /></a>
                      </div>
                      
                      <div className="activity-list">
                        {statistics.recentActivity.map((activity, index) => (
                          <div key={index} className="activity-item">
                            {renderActivityIcon(activity.type)}
                            <div className="activity-content">
                              <p className="activity-message">{activity.message}</p>
                              <p className="activity-date">{activity.date}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
          )}
          
          {page === 'accountants' && (
            <AccountantsAdmin />
          )}
          
          {page === 'clients' && (
            <ClientsAdmin />
          )}
          
          {page === 'requests' && (
            <RequestsAdmin />
          )}
        </section>
      </main>
    </div>
  );
}