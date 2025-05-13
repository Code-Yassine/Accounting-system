import React, { useState } from 'react';
import SignIn from './components/SignIn/SignIn';
import AdminDashboard from './components/Dashboard/AdminDashboard';
import AccountantDashboard from './components/Dashboard/AccountantDashboard';

function App() {
  const [user, setUser] = useState(() => {
    // Try to get user from sessionStorage first, then localStorage
    const storedUser = sessionStorage.getItem('user') || localStorage.getItem('user');
    const token = sessionStorage.getItem('token') || localStorage.getItem('token');
    
    if (!storedUser || !token) {
      return null;
    }
    
    try {
      return JSON.parse(storedUser);
    } catch {
      return null;
    }
  });

  const handleSignIn = (response) => {
    const { token, user: userData } = response;
    setUser(userData);
  };

  const handleSignOut = () => {
    setUser(null);
    // Clear both localStorage and sessionStorage
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('user');
    window.location.href = '/signin';
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
