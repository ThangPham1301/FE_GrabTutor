// src/contexts/AuthContext.jsx
import React, { createContext, useState, useEffect, useContext } from 'react';
import authApi from '../api/authApi';
import { jwtDecode } from "jwt-decode";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    try {
      const storedUser = localStorage.getItem('user');
      const token = localStorage.getItem('token');
      if (storedUser && token) {
        setUser(JSON.parse(storedUser));
      }
    } catch {
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
      const response = await authApi.login(credentials);
      console.log('Full API response:', response);
      
      const token = response.data?.token;
      console.log('Token:', token);
      
      if (token) {
        localStorage.setItem('token', token);
        const decoded = jwtDecode(token);
        console.log('JWT decoded:', decoded);
        
        // Xử lý scope - nó có dạng "ROLE_ADMIN", "ROLE_TUTOR", "ROLE_USER"
        // Lấy phần sau "ROLE_"
        let role = decoded.scope;
        if (role && role.startsWith('ROLE_')) {
          role = role.replace('ROLE_', '');
        }
        
        console.log('Extracted role:', role);
        
        const userData = {
          email: decoded.sub,
          role: role, // Giờ sẽ là "ADMIN", "TUTOR", "USER" chứ không phải "ROLE_ADMIN"
          userId: decoded.userId,
          fullName: decoded.fullName || decoded.sub,
          phoneNumber: decoded.phoneNumber || '',
          dob: decoded.dob || '',
          nationalId: decoded.nationalId || '',
          university: decoded.university || '',
          highestAcademicDegree: decoded.highestAcademicDegree || '',
          major: decoded.major || ''
        };
        
        console.log('Final userData:', userData);
        
        localStorage.setItem('user', JSON.stringify(userData));
        setUser(userData);
      }
      return response;
    } catch (err) {
      console.error('Login error:', err);
      setError(err.response?.data?.message || 'Login failed');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    authApi.logout();
    setUser(null);
    setError(null);
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

export const useAuth = () => useContext(AuthContext);