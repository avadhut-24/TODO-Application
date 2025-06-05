import { Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import TaskPage from './pages/TaskPage';
import PrivateRoute from './components/PrivateRoute';
import { SocketProvider } from './contexts/SocketContext';

function App() {
  return (
    <SocketProvider>
      <Routes>
        <Route element={<Layout />}>  
          <Route path="/" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route element={<PrivateRoute/>}>
            <Route path="/home" element={<HomePage />} />
            <Route path="/tasks/:listId" element={<TaskPage />} />
          </Route>
        </Route>
      </Routes>
    </SocketProvider>
  );
}

export default App;
