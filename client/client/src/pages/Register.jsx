import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { registerUser } from '../api/auth.api';
import Input from '../components/Input';
import Button from '../components/Button';
import ErrorMessage from '../components/ErrorMessage';

export default function Register() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    department: '',
    college: ''
  });
  const [validationErrors, setValidationErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState(null);

  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    if (validationErrors[e.target.name]) {
      setValidationErrors(prev => ({ ...prev, [e.target.name]: null }));
    }
  };

  const validate = () => {
    const errors = {};
    if (!formData.name.trim()) errors.name = 'Name is required';
    if (!formData.email.trim()) errors.email = 'Email is required';
    if (!formData.password) errors.password = 'Password is required';
    else if (formData.password.length < 8) errors.password = 'Password must be at least 8 characters long';
    if (!formData.department.trim()) errors.department = 'Department is required';
    if (!formData.college.trim()) errors.college = 'College is required';
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setApiError(null);

    if (!validate()) return;

    setIsLoading(true);

    try {
      await registerUser(formData);
      navigate('/login?registered=true');
    } catch (err) {
      const message = err.response?.data?.message || err.response?.data?.error || 'Something went wrong while registering.';
      setApiError(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full bg-white p-8 rounded-lg shadow-sm border border-gray-100">
        <div className="mb-8 text-center">
          <h2 className="text-3xl font-bold text-gray-900 tracking-tight">Create an account</h2>
          <p className="text-sm text-gray-500 mt-2">Join ProjectHub AI today</p>
        </div>

        <ErrorMessage message={apiError} />

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input 
            label="Full Name"
            name="name"
            value={formData.name} 
            onChange={handleChange} 
            placeholder="John Doe"
            error={validationErrors.name}
          />
          <Input 
            label="Email Address"
            type="email" 
            name="email"
            value={formData.email} 
            onChange={handleChange} 
            placeholder="you@example.com"
            error={validationErrors.email}
          />
          <Input 
            label="Password"
            type="password" 
            name="password"
            value={formData.password} 
            onChange={handleChange} 
            placeholder="••••••••"
            error={validationErrors.password}
          />
          <Input 
            label="Department"
            name="department"
            value={formData.department} 
            onChange={handleChange} 
            placeholder="e.g. Computer Science"
            error={validationErrors.department}
          />
          <Input 
            label="College/University"
            name="college"
            value={formData.college} 
            onChange={handleChange} 
            placeholder="e.g. MIT"
            error={validationErrors.college}
          />
          
          <div className="pt-2">
            <Button type="submit" isLoading={isLoading}>
              Register
            </Button>
          </div>
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            Already have an account?{' '}
            <Link to="/login" className="font-medium text-primary hover:text-[#1E3E75] transition-colors">
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
