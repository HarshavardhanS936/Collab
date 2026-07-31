const fs = require('fs');
const path = require('path');

const clientSrcPath = path.join(__dirname, 'client', 'src');

// 1. ErrorBoundary.jsx
const errorBoundaryContent = `import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
          <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full text-center">
            <svg className="w-16 h-16 text-red-500 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Something went wrong</h1>
            <p className="text-gray-600 mb-6">We encountered an unexpected error while rendering this page.</p>
            <button
              onClick={() => window.location.reload()}
              className="w-full bg-primary text-white py-2 px-4 rounded-md hover:bg-[#1E3E75] transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
            >
              Reload Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
`;
fs.writeFileSync(path.join(clientSrcPath, 'components', 'ErrorBoundary.jsx'), errorBoundaryContent);

// 2. ToastContext.jsx
const toastContextContent = `import React, { createContext, useContext, useState, useCallback } from 'react';

const ToastContext = createContext(null);

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const showToast = useCallback((message, type = 'info') => {
    const id = Date.now().toString() + Math.random().toString(36).substr(2, 9);
    setToasts(prev => [...prev, { id, message, type }]);
    
    // Auto dismiss after 3 seconds
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 3000);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      
      {/* Toast Container */}
      <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 pointer-events-none">
        {toasts.map(toast => (
          <div 
            key={toast.id} 
            className={\`pointer-events-auto flex items-center justify-between min-w-[300px] p-4 rounded-md shadow-lg transition-all duration-300 transform translate-y-0 opacity-100 \${
              toast.type === 'success' ? 'bg-green-600 text-white' : 
              toast.type === 'error' ? 'bg-red-600 text-white' : 
              'bg-gray-800 text-white'
            }\`}
          >
            <span className="text-sm font-medium">{toast.message}</span>
            <button 
              onClick={() => removeToast(toast.id)}
              className="ml-4 text-white/80 hover:text-white focus:outline-none"
            >
              &times;
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};
`;
fs.writeFileSync(path.join(clientSrcPath, 'context', 'ToastContext.jsx'), toastContextContent);

// 3. ErrorMessage.jsx
const errorMsgPath = path.join(clientSrcPath, 'components', 'ErrorMessage.jsx');
const errorMsgContent = `export default function ErrorMessage({ message, onRetry }) {
  if (!message) return null;
  return (
    <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-4 rounded-md shadow-sm">
      <div className="flex justify-between items-center">
        <p className="text-sm text-red-700">{message}</p>
        {onRetry && (
          <button 
            onClick={onRetry} 
            className="text-xs font-medium bg-red-100 text-red-800 px-3 py-1.5 rounded hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-1 transition-colors"
          >
            Retry
          </button>
        )}
      </div>
    </div>
  );
}
`;
fs.writeFileSync(errorMsgPath, errorMsgContent);

// 4. Navbar.jsx (Mobile Menu)
const navbarPath = path.join(clientSrcPath, 'components', 'Navbar.jsx');
let navbarContent = fs.readFileSync(navbarPath, 'utf8');
// Rewrite Navbar completely for robust mobile support
navbarContent = `import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Button from './Button';

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
                <Link to="/dashboard" className="text-gray-600 hover:text-primary px-3 py-2 rounded-md text-sm font-medium">Dashboard</Link>
                <Link to="/projects" className="text-gray-600 hover:text-primary px-3 py-2 rounded-md text-sm font-medium">Projects</Link>
                <Link to="/profile" className="text-gray-600 hover:text-primary px-3 py-2 rounded-md text-sm font-medium">Profile</Link>
                <span className="text-gray-300 mx-2">|</span>
                <span className="text-sm text-gray-500 mr-2">Hi, {user?.name?.split(' ')[0]}</span>
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
                <Link to="/dashboard" onClick={closeMenu} className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-primary hover:bg-blue-50">Dashboard</Link>
                <Link to="/projects" onClick={closeMenu} className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-primary hover:bg-blue-50">Projects</Link>
                <Link to="/profile" onClick={closeMenu} className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-primary hover:bg-blue-50">Profile</Link>
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
`;
fs.writeFileSync(navbarPath, navbarContent);

// 5. main.jsx
const mainPath = path.join(clientSrcPath, 'main.jsx');
let mainContent = fs.readFileSync(mainPath, 'utf8');
mainContent = mainContent.replace(
  'import App from \'./App.jsx\'',
  `import App from './App.jsx'
import ErrorBoundary from './components/ErrorBoundary.jsx'
import { ToastProvider } from './context/ToastContext.jsx'`
);
mainContent = mainContent.replace(
  '<App />',
  `<ErrorBoundary>
      <ToastProvider>
        <App />
      </ToastProvider>
    </ErrorBoundary>`
);
fs.writeFileSync(mainPath, mainContent);

console.log("Global components and Navbar setup complete.");
