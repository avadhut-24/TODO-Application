import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from '../api/axios';
import background from '../assets/background.png';
import showIcon from '../assets/showPassword.svg';
import hideIcon from '../assets/hidePassword.svg';

const NewPassword = () => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Check if email exists in sessionStorage
    const email = sessionStorage.getItem('resetEmail');
    if (!email) {
      navigate('/reset-password');
    }
  }, [navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const email = sessionStorage.getItem('resetEmail');
      await axios.post('/auth/reset-password', { email, password });
      
      // Clear session storage
      sessionStorage.removeItem('resetEmail');
      
      // Show success message and redirect
      alert('Password reset successful! Please login with your new password.');
      navigate('/');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to reset password. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex h-full">
      <div className="w-1/2">
        <form onSubmit={handleSubmit} className="flex flex-col gap-4 mx-28 my-10">
          <h1 className="font-bold text-xl mb-4">Set New Password</h1>
          
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-md p-4">
              <p className="text-red-700">{error}</p>
            </div>
          )}

          <div className="relative">
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
              New Password
            </label>
            <input
              id="password"
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-2 pr-10 border border-gray-300 rounded-md"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-2 top-8 text-gray-600"
            >
              <img
                src={showPassword ? hideIcon : showIcon}
                alt={showPassword ? 'Hide password' : 'Show password'}
                className="h-5 w-5"
              />
            </button>
          </div>

          <div className="relative">
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
              Confirm New Password
            </label>
            <input
              id="confirmPassword"
              type={showConfirmPassword ? 'text' : 'password'}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full p-2 pr-10 border border-gray-300 rounded-md"
              required
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-2 top-8 text-gray-600"
            >
              <img
                src={showConfirmPassword ? hideIcon : showIcon}
                alt={showConfirmPassword ? 'Hide password' : 'Show password'}
                className="h-5 w-5"
              />
            </button>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className={`bg-red-600 text-white p-2 rounded-md ${
              isLoading ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            {isLoading ? 'Resetting Password...' : 'Reset Password'}
          </button>

          <button
            type="button"
            onClick={() => navigate('/verify-otp')}
            className="text-gray-600 hover:text-gray-800"
          >
            Back to OTP Verification
          </button>
        </form>
      </div>
      <div className="w-1/2 absolute top-0 right-0 h-full">
        <img src={background} alt="background" className="w-full h-full object-cover" />
      </div>
    </div>
  );
};

export default NewPassword; 