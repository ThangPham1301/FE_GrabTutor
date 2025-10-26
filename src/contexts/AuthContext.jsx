// src/contexts/AuthContext.jsx
import React, { createContext, useState, useEffect, useContext } from 'react';
import authApi from '../api/authApi';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    try {
      const storedUser = localStorage.getItem('user');
      const token = localStorage.getItem('token');
      
      if (storedUser && token && storedUser !== 'undefined' && storedUser !== 'null') {
        const parsed = JSON.parse(storedUser);
        if (parsed && typeof parsed === 'object') {
          setUser(parsed);
        }
      }
    } catch (err) {
      console.error('Error parsing stored user:', err);
      localStorage.removeItem('user');
      localStorage.removeItem('token');
    } finally {
      setLoading(false);
    }
  }, []);

  const login = async (credentials) => {
    try {
      setLoading(true);
      setError(null);
      
      let response;
      
      // Choose login method based on role
      if (credentials.role === 'ADMIN') {
        response = await authApi.loginAdmin(credentials);
      } else if (credentials.role === 'TUTOR') {
        response = await authApi.loginTutor(credentials);
      } else {
        response = await authApi.loginStudent(credentials);
      }

      const userData = response.data?.data?.user;
      if (userData && typeof userData === 'object') {
        setUser(userData);
      }

      return response;
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    try {
      authApi.logout();
      setUser(null);
      setError(null);
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      loading,
      error,
      login,
      logout,
      isAuthenticated: !!user
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};