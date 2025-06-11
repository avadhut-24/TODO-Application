import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from '../api/axios';
import background from '../assets/background.png';

const VerifyOTP = () => {
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [timer, setTimer] = useState(60);
  const navigate = useNavigate();

  useEffect(() => {
    // Check if email exists in sessionStorage
    const email = sessionStorage.getItem('resetEmail');
    if (!email) {
      navigate('/reset-password');
    }

    // Start timer
    const interval = setInterval(() => {
      setTimer((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [navigate]);

  const handleOtpChange = (index: number, value: string) => {
    if (value.length > 1) return; // Only allow single digit
    if (!/^\d*$/.test(value)) return; // Only allow numbers

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < 5) {
      const nextInput = document.querySelector(`input[name=otp-${index + 1}]`) as HTMLInputElement;
      if (nextInput) nextInput.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      // Focus previous input on backspace if current input is empty
      const prevInput = document.querySelector(`input[name=otp-${index - 1}]`) as HTMLInputElement;
      if (prevInput) prevInput.focus();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const otpString = otp.join('');
    if (otpString.length !== 6) {
      setError('Please enter a valid 6-digit OTP');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const email = sessionStorage.getItem('resetEmail');
      await axios.post('/auth/verify-otp', { email, otp: otpString });
      navigate('/new-password');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Invalid OTP. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOTP = async () => {
    if (timer > 0) return;
    
    setIsLoading(true);
    setError(null);

    try {
      const email = sessionStorage.getItem('resetEmail');
      await axios.post('/auth/reset-password-request', { email });
      setTimer(60); // Reset timer
      setOtp(['', '', '', '', '', '']); // Clear OTP inputs
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to resend OTP. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex h-full">
      <div className="w-1/2">
        <form onSubmit={handleSubmit} className="flex flex-col gap-4 mx-28 my-10">
          <h1 className="font-bold text-xl mb-4">Verify OTP</h1>
          
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-md p-4">
              <p className="text-red-700">{error}</p>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Enter the 6-digit code sent to your email
            </label>
            <div className="flex gap-2 justify-center">
              {otp.map((digit, index) => (
                <input
                  key={index}
                  name={`otp-${index}`}
                  type="text"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleOtpChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  className="w-12 h-12 text-center text-xl border border-gray-300 rounded-md focus:border-red-500 focus:ring-1 focus:ring-red-500"
                />
              ))}
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className={`bg-red-600 text-white p-2 rounded-md ${
              isLoading ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            {isLoading ? 'Verifying...' : 'Verify OTP'}
          </button>

          <div className="text-center">
            {timer > 0 ? (
              <p className="text-gray-600">
                Resend OTP in {timer} seconds
              </p>
            ) : (
              <button
                type="button"
                onClick={handleResendOTP}
                disabled={isLoading}
                className="text-red-600 hover:text-red-700"
              >
                Resend OTP
              </button>
            )}
          </div>

          <button
            type="button"
            onClick={() => navigate('/reset-password')}
            className="text-gray-600 hover:text-gray-800"
          >
            Back to Reset Password
          </button>
        </form>
      </div>
      <div className="w-1/2 absolute top-0 right-0 h-full">
        <img src={background} alt="background" className="w-full h-full object-cover" />
      </div>
    </div>
  );
};

export default VerifyOTP; 