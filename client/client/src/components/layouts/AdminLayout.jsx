import { Outlet, NavLink, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import NotificationDropdown from '../NotificationDropdown';

export default function AdminLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/admin/login');
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col md:flex-row">
      {/* Sidebar */}
      <aside className="w-full md:w-64 bg-slate-900 text-white flex flex-col md:min-h-screen shadow-xl">
        <div className="p-6 border-b border-slate-800">
          <h1 className="text-xl font-bold tracking-tight text-white flex items-center">
            ProjectHub <span className="text-blue-400 ml-1">Admin</span>
          </h1>
        </div>
        
        <nav className="flex-1 p-4 space-y-2">
          <NavLink 
            to="/admin/dashboard" 
            className={({ isActive }) => `block px-4 py-3 rounded-lg text-sm font-medium transition-colors ${isActive ? 'bg-blue-600 text-white' : 'text-slate-300 hover:bg-slate-800 hover:text-white'}`}
          >
            Dashboard
          </NavLink>
          <NavLink 
            to="/admin/users" 
            className={({ isActive }) => `block px-4 py-3 rounded-lg text-sm font-medium transition-colors ${isActive ? 'bg-blue-600 text-white' : 'text-slate-300 hover:bg-slate-800 hover:text-white'}`}
          >
            Manage Users
          </NavLink>
          <NavLink 
            to="/admin/projects" 
            className={({ isActive }) => `block px-4 py-3 rounded-lg text-sm font-medium transition-colors ${isActive ? 'bg-blue-600 text-white' : 'text-slate-300 hover:bg-slate-800 hover:text-white'}`}
          >
            Manage Projects
          </NavLink>

          <NavLink 
            to="/admin/analytics" 
            className={({ isActive }) => `block px-4 py-3 rounded-lg text-sm font-medium transition-colors ${isActive ? 'bg-blue-600 text-white' : 'text-slate-300 hover:bg-slate-800 hover:text-white'}`}
          >
            Analytics
          </NavLink>
          <NavLink 
            to="/admin/settings" 
            className={({ isActive }) => `block px-4 py-3 rounded-lg text-sm font-medium transition-colors ${isActive ? 'bg-blue-600 text-white' : 'text-slate-300 hover:bg-slate-800 hover:text-white'}`}
          >
            Settings
          </NavLink>
        </nav>
        
        <div className="p-4 border-t border-slate-800">
          <div className="mb-4 px-2">
            <p className="text-xs text-slate-400 uppercase tracking-wider">Logged in as</p>
            <p className="text-sm font-medium text-white truncate">{user?.name}</p>
          </div>
          <button 
            onClick={handleLogout}
            className="w-full text-left px-4 py-2 text-sm text-red-400 hover:text-red-300 hover:bg-slate-800 rounded-lg transition-colors font-medium"
          >
            Log Out Admin
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-screen overflow-y-auto bg-slate-50">
        <header className="bg-white shadow-sm border-b border-gray-200 px-8 py-4 flex justify-between items-center hidden md:flex">
          <h2 className="text-lg font-semibold text-gray-800">Administration Portal</h2>
          <div className="flex items-center space-x-4">
            <NotificationDropdown />
            <Link to="/admin/profile" className="cursor-pointer hover:opacity-80 transition-opacity">
              <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 shadow-sm border border-blue-200">
                <span className="text-sm font-medium leading-none text-blue-700">
                  {user?.name?.charAt(0).toUpperCase()}
                </span>
              </span>
            </Link>
          </div>
        </header>
        <div className="p-8 max-w-7xl mx-auto w-full">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
