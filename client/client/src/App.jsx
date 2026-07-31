import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';

// Layouts and Guards
import UserLayout from './components/layouts/UserLayout';
import AdminLayout from './components/layouts/AdminLayout';
import ProtectedRouteUser from './components/layouts/ProtectedRouteUser';
import ProtectedRouteAdmin from './components/layouts/ProtectedRouteAdmin';

// Public Pages
import Login from './pages/Login';
import Register from './pages/Register';

// User Pages
import Dashboard from './pages/Dashboard';
import Projects from './pages/Projects';
import ProjectDetails from './pages/ProjectDetails';
import CreateProject from './pages/CreateProject';
import Profile from './pages/Profile';

// Admin Pages
import AdminLogin from './pages/admin/AdminLogin';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminUsers from './pages/admin/AdminUsers';
import AdminProjects from './pages/admin/AdminProjects';

// Admin Placeholders
const AdminPlaceholder = ({ title }) => (
  <div className="bg-white p-8 rounded-lg shadow-sm border border-slate-200">
    <h1 className="text-2xl font-bold text-slate-800 mb-4">{title}</h1>
    <p className="text-slate-500">This module is currently under construction.</p>
  </div>
);

export default function App() {
  const { isAuthenticated, role } = useAuth();

  return (
    <Routes>
      {/* 
        PUBLIC ROUTES 
        Redirect authenticated users away from auth pages 
      */}
      <Route path="/login" element={
        isAuthenticated ? <Navigate to={role === 'ADMIN' ? '/admin/dashboard' : '/dashboard'} replace /> : <Login />
      } />
      <Route path="/register" element={
        isAuthenticated ? <Navigate to={role === 'ADMIN' ? '/admin/dashboard' : '/dashboard'} replace /> : <Register />
      } />
      <Route path="/admin/login" element={
        isAuthenticated ? <Navigate to={role === 'ADMIN' ? '/admin/dashboard' : '/dashboard'} replace /> : <AdminLogin />
      } />
      
      {/* USER PORTAL */}
      <Route element={<ProtectedRouteUser />}>
        <Route element={<UserLayout />}>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/projects" element={<Projects />} />
          <Route path="/projects/:id" element={<ProjectDetails />} />
          <Route path="/profile" element={<Profile />} />
        </Route>
      </Route>

      {/* ADMIN PORTAL */}
      <Route path="/admin" element={<ProtectedRouteAdmin />}>
        <Route element={<AdminLayout />}>
          <Route index element={<Navigate to="/admin/dashboard" replace />} />
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="users" element={<AdminUsers />} />
          <Route path="projects" element={<AdminProjects />} />
          <Route path="projects/new" element={<CreateProject />} />
          <Route path="projects/:id" element={<ProjectDetails />} />
          <Route path="profile" element={<Profile />} />
          <Route path="analytics" element={<AdminPlaceholder title="Analytics & Reports" />} />
          <Route path="settings" element={<AdminPlaceholder title="Platform Settings" />} />
        </Route>
      </Route>
      
      {/* 404 Fallback */}
      <Route path="*" element={<Navigate to={isAuthenticated ? (role === 'ADMIN' ? '/admin/dashboard' : '/dashboard') : '/login'} replace />} />
    </Routes>
  );
}
