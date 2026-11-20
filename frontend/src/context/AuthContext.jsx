import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('airguard_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem('airguard_token'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadUser() {
      const storedToken = localStorage.getItem('airguard_token');
      if (storedToken) {
        try {
          const userData = await api.getMe();
          setUser(userData);
          localStorage.setItem('airguard_user', JSON.stringify(userData));
        } catch {
          logout();
        }
      }
      setLoading(false);
    }
    loadUser();
  }, []);

  const login = async (credentials) => {
    const res = await api.login(credentials);
    setToken(res.access_token);
    setUser(res.user);
    localStorage.setItem('airguard_token', res.access_token);
    localStorage.setItem('airguard_user', JSON.stringify(res.user));
    return res.user;
  };

  const register = async (userData) => {
    const res = await api.register(userData);
    setToken(res.access_token);
    setUser(res.user);
    localStorage.setItem('airguard_token', res.access_token);
    localStorage.setItem('airguard_user', JSON.stringify(res.user));
    return res.user;
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('airguard_token');
    localStorage.removeItem('airguard_user');
  };

  const updateUser = (updatedData) => {
    setUser(updatedData);
    localStorage.setItem('airguard_user', JSON.stringify(updatedData));
  };

  const value = {
    user,
    token,
    loading,
    isAuthenticated: !!token && !!user,
    isAdmin: user?.role === 'admin',
    login,
    register,
    logout,
    updateUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

