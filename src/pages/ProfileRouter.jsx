import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import StudentProfile from './Student/Profile';
import TutorProfile from './Tutor/Profile';
import AdminDashboard from './admin/Dashboard';

export default function ProfileRouter() {
  const { user } = useAuth();

  if (!user) {
    return <div className="text-center py-8">Loading...</div>;
  }

  // ✅ Routing theo role
  switch (user.role) {
    case 'USER':
      return <StudentProfile />;
    case 'TUTOR':
      return <TutorProfile />;
    case 'ADMIN':
      return <AdminDashboard />;
    default:
      return <div className="text-center py-8">Unknown role: {user.role}</div>;
  }
}