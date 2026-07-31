import { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchMe } from '../api/auth.api';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const initializeAuth = async () => {
      const storedToken = localStorage.getItem('projecthub_token');
      
      if (storedToken) {
        try {
          // fetchMe uses the token from localStorage via axios interceptor
          const userData = await fetchMe();
          setToken(storedToken);
          // fetchMe returns { success, message, data: { user: {...} } }
          const userObj = userData?.data?.user || userData?.user || userData;
          setUser(userObj);
        } catch (error) {
          console.error('Failed to restore session:', error);
          localStorage.removeItem('projecthub_token');
          localStorage.removeItem('projecthub_user');
          setToken(null);
          setUser(null);
        }
      }
      setIsLoading(false);
    };

    initializeAuth();
  }, []);

  const login = (userData, userToken) => {
    localStorage.setItem('projecthub_token', userToken);
    localStorage.setItem('projecthub_user', JSON.stringify(userData));
    setToken(userToken);
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem('projecthub_token');
    localStorage.removeItem('projecthub_user');
    setToken(null);
    setUser(null);
    navigate('/login');
  };

  const isAuthenticated = !!token;
  const role = user?.role || 'USER';
  const isAdmin = role === 'ADMIN';

  return (
    <AuthContext.Provider value={{ user, token, isLoading, login, logout, isAuthenticated, role, isAdmin }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
