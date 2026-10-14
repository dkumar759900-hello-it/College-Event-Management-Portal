import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('cep_token') || null);
  const [loading, setLoading] = useState(true);

  // Load current user profile on app start if token exists
  useEffect(() => {
    const fetchUser = async () => {
      if (token) {
        try {
          const res = await api.get('/auth/me');
          setUser(res.data.user);
        } catch (err) {
          console.error('Session expired or invalid token:', err);
          logout();
        }
      }
      setLoading(false);
    };

    fetchUser();
  }, [token]);

  const login = async (email, password) => {
    const res = await api.post('/auth/login', { email, password });
    if (res.data.success) {
      localStorage.setItem('cep_token', res.data.token);
      setToken(res.data.token);
      setUser(res.data.user);
      return res.data;
    }
  };

  const register = async (formData) => {
    const res = await api.post('/auth/register', formData);
    if (res.data.success) {
      localStorage.setItem('cep_token', res.data.token);
      setToken(res.data.token);
      setUser(res.data.user);
      return res.data;
    }
  };

  const logout = () => {
    localStorage.removeItem('cep_token');
    setToken(null);
    setUser(null);
  };

  // 1-Click switch for presentation & demo
  const quickDemoLogin = async (role) => {
    const credentials = {
      admin: { email: 'admin@college.edu', password: 'password123' },
      coordinator: { email: 'coordinator@college.edu', password: 'password123' },
      student: { email: 'deepak@college.edu', password: 'password123' }
    };

    const target = credentials[role];
    if (target) {
      return await login(target.email, target.password);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        login,
        register,
        logout,
        quickDemoLogin,
        isAuthenticated: !!user,
        isCoordinatorOrAdmin: user?.role === 'coordinator' || user?.role === 'admin',
        isAdmin: user?.role === 'admin'
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
