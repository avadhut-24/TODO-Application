// src/pages/Login.tsx
import { useAuth } from '../context/AuthContext';
import type { User } from '../context/AuthContext';
import { useState } from 'react';
import axios from '../api/axios';
import background from '../assets/background.png';
import { useNavigate } from 'react-router-dom';
import googleIcon from '../assets/googleIcon.png';
import showIcon from '../assets/showPassword.svg';
import hideIcon from '../assets/hidePassword.svg';

interface LoginResponse {
  token: string;
  user: User;
}

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [show, setShow] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await axios.post<LoginResponse>('/auth/login', { email, password });
      login(res.data.token, res.data.user); // this should internally store token in localStorage
      navigate('/home');
    } catch (error) {
      console.error('Login failed', error);
      alert('Invalid credentials. Please try again.');
    }
  };

  return (
    <div className='flex h-full'>
      <div className='w-1/2'>
        <form onSubmit={handleSubmit} className='flex flex-col gap-4 mx-28 my-10'>
          <h1 className='font-bold text-xl mb-4'>Login to TODO</h1>

          <div className='flex gap-2 border border-gray-300 rounded-md p-2 bg-[#2828280A] justify-center items-center'>
            <img src={googleIcon} alt="google icon" />
            <button type="button">Continue with Email</button>
          </div>

          <div className='flex justify-center items-center'>
            <hr className="border-t border-gray-300 my-4 w-1/2" />
            <span className='mx-2'>or</span>
            <hr className="border-t border-gray-300 my-4 w-1/2" />
          </div>

          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className='p-2 border border-gray-300 rounded-md'
            required
          />

          <div className="relative w-full">
            <input
              type={show ? 'text' : 'password'}
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-2 pr-10 border border-gray-300 rounded-md"
              required
            />
            <button
              type="button"
              onClick={() => setShow((prev) => !prev)}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-600"
            >
              <img
                src={show ? hideIcon : showIcon}
                alt={show ? 'Hide password' : 'Show password'}
                className="h-5 w-5"
              />
            </button>
          </div>

          <h5 className='text-right font-semibold cursor-pointer'>Reset Password</h5>

          <button type="submit" className='bg-[#9E9E9E] text-white p-2 rounded-md'>
            Login
          </button>

          <h4 className='text-left'>
            Don't have an account yet?{' '}
            <span className='font-semibold text-[#D52121] cursor-pointer' onClick={() => navigate('/signup')}>
              Sign up
            </span>
          </h4>
        </form>
      </div>

      <div className='w-1/2 absolute top-0 right-0 h-full'>
        <img
          src={background}
          alt="background"
          className="w-full h-full object-cover"
        />
      </div>
    </div>
  );
};

export default Login;
