import { useEffect, useState, useRef } from 'react';
import { useNavigate, useSearchParams, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const GoogleCallback = () => {
  const [searchParams] = useSearchParams();
  const { login, isAuthenticated, user, isLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isProcessing, setIsProcessing] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [debugInfo, setDebugInfo] = useState<string[]>([]);
  const hasProcessedAuth = useRef(false);

  const addDebugInfo = (info: string) => {
    console.log(`[GoogleCallback] ${info}`);
    setDebugInfo(prev => [...prev, `${new Date().toLocaleTimeString()}: ${info}`]);
  };

  useEffect(() => {
    // Skip if already processed or if already authenticated
    if (hasProcessedAuth.current || isAuthenticated) {
      addDebugInfo('Skipping auth processing - already processed or authenticated');
      return;
    }

    addDebugInfo(`Component mounted. Location: ${location.pathname}`);
    addDebugInfo(`Auth state - isAuthenticated: ${isAuthenticated}, isLoading: ${isLoading}, user: ${user?.email || 'null'}`);
    
    const processGoogleCallback = async () => {
      try {
        const token = searchParams.get('token');
        const userStr = searchParams.get('user');

        addDebugInfo(`URL params - token: ${token ? 'Present' : 'Missing'}, userStr: ${userStr ? 'Present' : 'Missing'}`);

        if (token && userStr) {
          try {
            const parsedUser = JSON.parse(decodeURIComponent(userStr));
            addDebugInfo(`Parsed user: ${JSON.stringify(parsedUser)}`);
            
            addDebugInfo('Calling login function...');
            login(token, parsedUser);
            hasProcessedAuth.current = true;
            
            addDebugInfo('Login function called, waiting for state update...');
            
          } catch (parseError) {
            addDebugInfo(`Parse error: ${parseError}`);
            setError('Invalid user data received');
            setTimeout(() => navigate('/login', { replace: true }), 2000);
          }
        } else {
          addDebugInfo('Missing token or user data - redirecting to login');
          setError('Authentication failed - missing credentials');
          setTimeout(() => navigate('/login', { replace: true }), 2000);
        }
      } catch (error) {
        addDebugInfo(`Processing error: ${error}`);
        setError('Authentication failed');
        setTimeout(() => navigate('/login', { replace: true }), 2000);
      } finally {
        setIsProcessing(false);
        addDebugInfo('Processing completed');
      }
    };

    processGoogleCallback();
  }, [searchParams, login, navigate, location.pathname, isAuthenticated, isLoading, user]);

  // Separate effect to handle navigation after auth state changes
  useEffect(() => {
    addDebugInfo(`Auth state changed - isAuthenticated: ${isAuthenticated}, isLoading: ${isLoading}`);
    
    if (!isLoading && isAuthenticated && !error && hasProcessedAuth.current) {
      addDebugInfo('User is authenticated and not loading - attempting navigation...');
      // Use a single timeout for navigation
      const timeoutId = setTimeout(() => {
        addDebugInfo('Navigating to /home...');
        navigate('/home', { replace: true });
      }, 500);
      
      return () => clearTimeout(timeoutId);
    }
  }, [isAuthenticated, isLoading, navigate, error]);

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center max-w-md">
          <div className="text-red-500 mb-4">{error}</div>
          <div className="text-sm text-gray-500 mb-4">Redirecting to login...</div>
          <div className="text-xs text-left bg-gray-100 p-2 rounded max-h-40 overflow-y-auto">
            {debugInfo.map((info, index) => (
              <div key={index}>{info}</div>
            ))} 
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center max-w-md">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
        <div className="text-gray-600 mb-4">
          {isProcessing ? 'Processing authentication...' : 'Checking authentication...'}
        </div>
        <div className="text-xs text-left bg-gray-100 p-2 rounded max-h-40 overflow-y-auto">
          <div className="font-semibold mb-2">Debug Info:</div>
          {debugInfo.map((info, index) => (
            <div key={index}>{info}</div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default GoogleCallback;