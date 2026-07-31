import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchNotifications, markNotificationAsRead, markAllNotificationsAsRead } from '../api/notification.api';
import { useAuth } from '../context/AuthContext';

export default function NotificationDropdown() {
  const [notifications, setNotifications] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { isAuthenticated, role } = useAuth();
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  const loadNotifications = async () => {
    if (!isAuthenticated) return;
    try {
      const res = await fetchNotifications();
      setNotifications(res.notifications || res.data?.notifications || []);
    } catch (err) {
      console.error('Failed to load notifications', err);
    }
  };

  useEffect(() => {
    loadNotifications();
    // Poll every 30 seconds
    const interval = setInterval(loadNotifications, 30000);
    return () => clearInterval(interval);
  }, [isAuthenticated]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const unreadCount = notifications.filter(n => !n.read).length;

  const handleNotificationClick = async (notification) => {
    if (!notification.read) {
      try {
        await markNotificationAsRead(notification._id);
        setNotifications(prev => prev.map(n => n._id === notification._id ? { ...n, read: true } : n));
      } catch (err) {
        console.error('Failed to mark notification as read', err);
      }
    }
    setIsOpen(false);
    
    // Navigate to project
    const projectId = notification.relatedProject?._id || notification.relatedProject;
    if (projectId) {
      navigate(role === 'ADMIN' ? `/admin/projects/${projectId}` : `/projects/${projectId}`);
    }
  };

  const handleMarkAllRead = async (e) => {
    e.stopPropagation();
    try {
      await markAllNotificationsAsRead();
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    } catch (err) {
      console.error('Failed to mark all as read', err);
    }
  };

  if (!isAuthenticated) return null;

  return (
    <div className="relative" ref={dropdownRef}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-gray-500 hover:text-primary transition-colors focus:outline-none"
      >
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 inline-flex items-center justify-center px-1.5 py-0.5 text-xs font-bold leading-none text-white transform translate-x-1/4 -translate-y-1/4 bg-red-600 rounded-full">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-md shadow-lg border border-gray-100 z-50 overflow-hidden">
          <div className="p-3 border-b border-gray-100 flex justify-between items-center bg-gray-50">
            <h3 className="text-sm font-semibold text-gray-700">Notifications</h3>
            {unreadCount > 0 && (
              <button 
                onClick={handleMarkAllRead}
                className="text-xs text-blue-600 hover:text-blue-800 font-medium"
              >
                Mark all as read
              </button>
            )}
          </div>
          <div className="max-h-80 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-4 text-center text-sm text-gray-500">
                No notifications yet.
              </div>
            ) : (
              <ul className="divide-y divide-gray-100">
                {notifications.map(notification => (
                  <li 
                    key={notification._id}
                    onClick={() => handleNotificationClick(notification)}
                    className={`p-3 hover:bg-gray-50 cursor-pointer transition-colors ${!notification.read ? 'bg-blue-50/30' : ''}`}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`mt-1 h-2 w-2 rounded-full flex-shrink-0 ${!notification.read ? 'bg-blue-600' : 'bg-transparent'}`} />
                      <div>
                        <p className={`text-sm ${!notification.read ? 'text-gray-900 font-medium' : 'text-gray-600'}`}>
                          {notification.message}
                        </p>
                        <p className="text-xs text-gray-400 mt-1">
                          {new Date(notification.createdAt).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
