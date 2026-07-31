import { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Button from './Button';
import NotificationDropdown from './NotificationDropdown';

export default function Navbar() {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    setIsMobileMenuOpen(false);
  };

  const closeMenu = () => setIsMobileMenuOpen(false);

  return (
    <nav className="bg-white shadow-sm border-b border-gray-100 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to={isAuthenticated ? "/dashboard" : "/"} className="flex-shrink-0 flex items-center" onClick={closeMenu}>
              <span className="text-2xl font-bold text-primary tracking-tight">ProjectHub <span className="text-blue-500">AI</span></span>
            </Link>
          </div>
          
          {/* Desktop Menu */}
          <div className="hidden md:flex md:items-center md:space-x-4">
            {isAuthenticated ? (
              <>
                <NavLink to="/dashboard" className={({ isActive }) => `px-3 py-2 rounded-md text-sm font-medium ${isActive ? 'text-primary bg-blue-50' : 'text-gray-600 hover:text-primary'}`}>Dashboard</NavLink>
                <NavLink to="/projects" className={({ isActive }) => `px-3 py-2 rounded-md text-sm font-medium ${isActive ? 'text-primary bg-blue-50' : 'text-gray-600 hover:text-primary'}`}>Projects</NavLink>
                <NavLink to="/profile" className={({ isActive }) => `px-3 py-2 rounded-md text-sm font-medium ${isActive ? 'text-primary bg-blue-50' : 'text-gray-600 hover:text-primary'}`}>Profile</NavLink>
                <div className="ml-2 mr-2 border-l border-gray-300 h-6"></div>
                <NotificationDropdown />
                <span className="text-sm text-gray-500 mx-2 hidden lg:block">Hi, {user?.name?.split(' ')[0]}</span>
                <Button onClick={handleLogout} className="w-auto px-4 py-1.5 text-sm bg-gray-100 text-gray-700 hover:bg-gray-200 border-none">
                  Logout
                </Button>
              </>
            ) : (
              <>
                <Link to="/login" className="text-gray-600 hover:text-primary px-3 py-2 rounded-md text-sm font-medium">Log In</Link>
                <Button onClick={() => navigate('/register')} className="w-auto px-4 py-1.5 text-sm">
                  Get Started
                </Button>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="flex items-center md:hidden">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary"
            >
              <span className="sr-only">Open main menu</span>
              {!isMobileMenuOpen ? (
                <svg className="block h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              ) : (
                <svg className="block h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden absolute top-16 left-0 w-full bg-white border-b border-gray-200 shadow-lg z-40">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            {isAuthenticated ? (
              <>
                <div className="px-3 py-2 text-sm text-gray-500 bg-gray-50 rounded-md mb-2 border-l-4 border-primary">
                  Signed in as <span className="font-bold text-gray-800">{user?.name}</span>
                </div>
                <NavLink to="/dashboard" onClick={closeMenu} className={({ isActive }) => `block px-3 py-2 rounded-md text-base font-medium ${isActive ? 'text-primary bg-blue-50' : 'text-gray-700 hover:text-primary hover:bg-blue-50'}`}>Dashboard</NavLink>
                <NavLink to="/projects" onClick={closeMenu} className={({ isActive }) => `block px-3 py-2 rounded-md text-base font-medium ${isActive ? 'text-primary bg-blue-50' : 'text-gray-700 hover:text-primary hover:bg-blue-50'}`}>Projects</NavLink>
                <NavLink to="/profile" onClick={closeMenu} className={({ isActive }) => `block px-3 py-2 rounded-md text-base font-medium ${isActive ? 'text-primary bg-blue-50' : 'text-gray-700 hover:text-primary hover:bg-blue-50'}`}>Profile</NavLink>
                <button onClick={handleLogout} className="w-full text-left mt-2 block px-3 py-2 rounded-md text-base font-medium text-red-600 hover:bg-red-50">
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/login" onClick={closeMenu} className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-primary hover:bg-blue-50">Log In</Link>
                <Link to="/register" onClick={closeMenu} className="block px-3 py-2 rounded-md text-base font-medium text-primary hover:bg-blue-50">Get Started</Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
