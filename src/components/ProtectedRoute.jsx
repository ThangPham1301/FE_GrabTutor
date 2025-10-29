import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export function ProtectedRoute({ element, allowedRoles, children }) {
  const { user, loading } = useAuth();
  const token = localStorage.getItem('token');

  console.log('=== ProtectedRoute Debug ===');
  console.log('loading:', loading);
  console.log('user:', user);
  console.log('allowedRoles:', allowedRoles);
  console.log('user?.role:', user?.role);

  if (loading) {
    console.log('ProtectedRoute: loading...');
    return <div>Loading...</div>;
  }

  if (!user || !token) {
    console.log('ProtectedRoute: Không có user hoặc token, chuyển về /login');
    return <Navigate to="/login" />; // ← Thay /login-role thành /login
  }

  // Kiểm tra allowedRoles
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    console.log(`ProtectedRoute: Role không đúng. allowedRoles=${allowedRoles}, user.role=${user.role}`);
    
    if (user.role === 'ADMIN') {
      console.log('ProtectedRoute: Chuyển về /admin/dashboard');
      return <Navigate to="/admin/dashboard" />;
    }
    if (user.role === 'TUTOR') {
      console.log('ProtectedRoute: Chuyển về /tutor/profile');
      return <Navigate to="/tutor/profile" />;
    }
    if (user.role === 'USER') {
      console.log('ProtectedRoute: Chuyển về /student/profile');
      return <Navigate to="/student/profile" />;
    }
    
    console.log('ProtectedRoute: Role không hợp lệ, chuyển về /');
    return <Navigate to="/" />;
  }

  console.log('ProtectedRoute: Truy cập hợp lệ');
  return element || children;
}
