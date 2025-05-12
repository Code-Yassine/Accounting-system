import React, { createContext, useState, useContext, useEffect } from 'react';
import { signIn } from '../api/auth';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem('user');
    return stored ? JSON.parse(stored) : null;
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if the stored user data is still valid
    const checkAuth = async () => {
      if (user) {
        try {
          // You can add an API call here to verify the token/session
          // For now, we'll just check if the stored data exists
          const stored = localStorage.getItem('user');
          if (!stored) {
            setUser(null);
          }
        } catch (error) {
          console.error('Auth check failed:', error);
          setUser(null);
          localStorage.removeItem('user');
        }
      }
      setLoading(false);
    };

    checkAuth();
  }, [user]);

  const login = async (email, password) => {
    try {
      const data = await signIn(email, password);
      setUser(data);
      localStorage.setItem('user', JSON.stringify(data));
      return data;
    } catch (error) {
      throw error;
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
  };

  const value = {
    user,
    loading,
    login,
    logout,
    isAuthenticated: !!user
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}; 