import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  const token = localStorage.getItem('token');

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!user || !token) {
    return <Navigate to="/login-role" />;
  }

  return children;
};