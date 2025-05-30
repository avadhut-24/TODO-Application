// src/components/Navbar.tsx
import { useAuth } from '../context/AuthContext';
import { Link, Outlet } from 'react-router-dom';
import todoIcon from '../assets/todo-icon.png';

const Layout = () => {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen relative ">
      <nav className="flex justify-between items-center h-16 px-4">
        <Link to="/home" className="flex items-center space-x-2">
          <img src={todoIcon} alt="Todo Icon" className="w-8 h-8" />
          <span>TODO</span>
        </Link>
        {user && (
          <div className="flex items-center space-x-3">
            <span className="text-sm">{user.firstName}</span>
            <button onClick={logout} className="text-red-500">Logout</button>
          </div>
        )}
      </nav>
      <main>
        <Outlet />
      </main>
    </div>
  );
};

export default Layout;
