import { Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import TaskPage from './pages/TaskPage';
import PrivateRoute from './components/PrivateRoute';
import { SocketProvider } from './contexts/SocketContext';
import GoogleCallback from './pages/GoogleCallback';
import ResetPasswordRequest from './pages/ResetPasswordRequest';
import VerifyOTP from './pages/VerifyOTP';
import NewPassword from './pages/NewPassword';

function App() {
  return (
    <SocketProvider>
      <Routes>
        <Route element={<Layout />}>  
          <Route path="/" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/reset-password" element={<ResetPasswordRequest />} />
          <Route path="/verify-otp" element={<VerifyOTP />} />
          <Route path="/new-password" element={<NewPassword />} />
          <Route element={<PrivateRoute/>}>
            <Route path="/home" element={<HomePage />} />
            <Route path="/tasks/:listId" element={<TaskPage />} />
          </Route>
          <Route path="/auth/google/callback" element={<GoogleCallback />} />
        </Route>
      </Routes>
    </SocketProvider>
  );
}

export default App;
