import { useState, useEffect } from 'react';
import { useLocation, useNavigate, Link, useSearchParams } from 'react-router-dom';
import { useToast } from '../context/ToastContext';
import { loginUser } from '../api/auth.api';
import { useAuth } from '../context/AuthContext';
import Input from '../components/Input';
import Button from '../components/Button';
import ErrorMessage from '../components/ErrorMessage';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const location = useLocation();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const { login } = useAuth();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get('registered') === 'true') {
      showToast("Registration successful! Please log in.", "success");
      // Remove param from URL to prevent infinite toasts on refresh
      navigate('/login', { replace: true });
    }
  }, [location, showToast, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const data = await loginUser({ email, password });
      
      const user = data.data?.user || data.user;
      const token = data.data?.token || data.token;
      
      login(user, token);
      navigate('/dashboard');
    } catch (err) {
      const message = err.response?.data?.message || err.response?.data?.error || 'Something went wrong while logging in.';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full bg-white p-8 rounded-lg shadow-sm border border-gray-100">
        <div className="mb-8 text-center">
          <h2 className="text-3xl font-bold text-gray-900 tracking-tight">Welcome back</h2>
          <p className="text-sm text-gray-500 mt-2">Log in to your ProjectHub AI account</p>
        </div>
        
        <ErrorMessage message={error} />

        <form onSubmit={handleSubmit} className="space-y-6">
          <Input 
            label="Email Address"
            type="email" 
            required 
            value={email} 
            onChange={(e) => setEmail(e.target.value)} 
            placeholder="you@example.com"
          />
          <Input 
            label="Password"
            type="password" 
            required 
            value={password} 
            onChange={(e) => setPassword(e.target.value)} 
            placeholder="••••••••"
          />
          
          <Button type="submit" isLoading={isLoading}>
            Sign In
          </Button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            Don't have an account?{' '}
            <Link to="/register" className="font-medium text-primary hover:text-[#1E3E75] transition-colors">
              Register
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
