import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';

export interface User {
  firstName: string;
  lastName: string;
  email: string;
  id: string;
}

interface AuthContextType {
  isAuthenticated: boolean;
  user: User | null;
  login: (token: string, user: User) => void;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProviderWrapper = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  // Initialize auth state from localStorage
  useEffect(() => {
    const initializeAuth = async () => {
      console.log('[AuthContext] Initializing auth state...');
      try {
        const savedUser = localStorage.getItem('user');
        const savedToken = localStorage.getItem('token');
        
        console.log('[AuthContext] Saved data - Token:', savedToken ? 'Present' : 'Missing', 'User:', savedUser ? 'Present' : 'Missing');
        
        if (savedUser && savedToken) {
          const parsedUser = JSON.parse(savedUser);
          setUser(parsedUser);
          console.log('[AuthContext] Restored user from localStorage:', parsedUser);
        }
      } catch (error) {
        console.error('[AuthContext] Error initializing auth state:', error);
        // Clear corrupted data
        localStorage.removeItem('user');
        localStorage.removeItem('token');
      } finally {
        setIsLoading(false);
        console.log('[AuthContext] Auth initialization completed');
      }
    };

    initializeAuth();
  }, []);

  // Calculate isAuthenticated
  const isAuthenticated = !!localStorage.getItem('token') && user !== null;

  // Log auth state changes
  useEffect(() => {
    console.log('[AuthContext] Auth state changed:', {
      isAuthenticated,
      isLoading,
      user: user?.email || 'null',
      hasToken: !!localStorage.getItem('token')
    });
  }, [isAuthenticated, isLoading, user]);

  const login = (token: string, user: User) => {
    console.log('[AuthContext] Login called with:', { token: token ? 'Present' : 'Missing', userEmail: user.email });
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
    setUser(user);
    console.log('[AuthContext] Login completed - user state updated');
  };

  const logout = () => {
    console.log('[AuthContext] Logout called');
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    navigate('/');
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};