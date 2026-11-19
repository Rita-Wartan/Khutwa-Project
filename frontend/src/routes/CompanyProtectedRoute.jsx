import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function CompanyProtectedRoute({ children }) {
  const { isAuthenticated, user } = useAuth();
  if (!isAuthenticated || user?.role !== 'company') return <Navigate to="/company/login" replace />;
  return children;
}
