import React from 'react';
import './Dashboard.css';

export default function Dashboard({ onSignOut }) {
  return (
    <div className="dashboard-bg">
      <aside className="dashboard-sidebar">
        <div className="dashboard-logo">FinBooks</div>
        <nav className="dashboard-nav">
          <a className="active" href="#">Dashboard</a>
          <a href="#">Clients</a>
          <a href="#">Documents</a>
          <a href="#">Invoices</a>
        </nav>
        <button className="dashboard-signout" onClick={onSignOut}>Sign out</button>
      </aside>
      <main className="dashboard-main">
        <header className="dashboard-header">
          <h1>Accounting Management System</h1>
          <div className="dashboard-user">
            <span className="dashboard-user-avatar">AC</span>
            <span className="dashboard-user-name">Accountant User</span>
          </div>
        </header>
        <section className="dashboard-content">
          {/* Dashboard content is now empty */}
        </section>
      </main>
    </div>
  );
} 