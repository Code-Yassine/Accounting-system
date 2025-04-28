import React, { useState } from 'react';
import SignIn from './components/SignIn/SignIn';
import AdminDashboard from './components/Dashboard/AdminDashboard';
import AccountantDashboard from './components/Dashboard/AccountantDashboard';

function App() {
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem('user');
    return stored ? JSON.parse(stored) : null;
  });

  const handleSignIn = (userData) => {
    setUser(userData);
  };

  const handleSignOut = () => {
    setUser(null);
    localStorage.removeItem('user');
  };

  if (!user) {
    return <SignIn onSignIn={handleSignIn} />;
  }

  if (user.role === 'admin') {
    return <AdminDashboard onSignOut={handleSignOut} />;
  }

  if (user.role === 'accountant') {
    return <AccountantDashboard onSignOut={handleSignOut} />;
  }

  // For any other role (e.g., client), sign out and show SignIn
  handleSignOut();
  return <SignIn onSignIn={handleSignIn} />;
}

export default App;
