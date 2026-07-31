import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Loader from './Loader';

export default function ProtectedRoute() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <Loader />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}
