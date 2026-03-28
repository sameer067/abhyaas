import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ToastProvider } from './components/Toast';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Clients from './pages/Clients';
import AddClient from './pages/AddClient';
import ClientDetail from './pages/ClientDetail';
import CheckIn from './pages/CheckIn';
import CheckInSuccess from './pages/CheckInSuccess';
import Profile from './pages/Profile';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { coach, loading } = useAuth();
  if (loading) return null;
  return coach ? <>{children}</> : <Navigate to="/login" replace />;
}

function AppRoutes() {
  const { coach } = useAuth();

  return (
    <AnimatePresence mode="wait">
      <Routes>
        <Route path="/login" element={coach ? <Navigate to="/dashboard" /> : <Login />} />
        <Route path="/register" element={coach ? <Navigate to="/dashboard" /> : <Register />} />
        <Route path="/checkin/:clientId/:token" element={<CheckIn />} />
        <Route path="/checkin-success" element={<CheckInSuccess />} />
        <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/clients" element={<ProtectedRoute><Clients /></ProtectedRoute>} />
        <Route path="/clients/:id" element={<ProtectedRoute><ClientDetail /></ProtectedRoute>} />
        <Route path="/add-client" element={<ProtectedRoute><AddClient /></ProtectedRoute>} />
        <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </AnimatePresence>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ToastProvider>
          <AppRoutes />
        </ToastProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
