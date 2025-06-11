import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const PrivateRoute = () => {
  const { isAuthenticated, isLoading, user } = useAuth();
  const location = useLocation();

  console.log('[PrivateRoute] Checking access to:', location.pathname);
  console.log('[PrivateRoute] Auth state:', { isAuthenticated, isLoading, userEmail: user?.email || 'null' });

  // Show loading spinner while checking authentication
  if (isLoading) {
    console.log('[PrivateRoute] Still loading auth state - showing spinner');
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <div className="text-gray-600">Checking authentication...</div>
          <div className="text-xs text-gray-400 mt-2">
            Path: {location.pathname} | Loading: {isLoading.toString()} | Auth: {isAuthenticated.toString()}
          </div>
        </div>
      </div>
    );
  }

  // If not authenticated, redirect to login
  if (!isAuthenticated) {
    console.log('[PrivateRoute] User not authenticated - redirecting to login');
    return <Navigate to="/" replace />;
  }

  // If authenticated, render the protected route
  console.log('[PrivateRoute] User authenticated - rendering protected content');
  return <Outlet />;
};

export default PrivateRoute;