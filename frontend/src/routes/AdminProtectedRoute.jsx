import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function AdminProtectedRoute({ children }) {
  const { token, user } = useAuth();

  if (!token) return <Navigate to="/admin/login" replace />;
  if (user?.role !== 'admin') return <Navigate to="/" replace />;

  return children;
}
