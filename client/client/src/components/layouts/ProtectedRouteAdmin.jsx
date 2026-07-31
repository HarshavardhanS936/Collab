import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Loader from '../Loader';

export default function ProtectedRouteAdmin() {
  const { isAuthenticated, isLoading, role } = useAuth();

  if (isLoading) {
    return <Loader />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/admin/login" replace />;
  }
  
  if (role !== 'ADMIN') {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
}
