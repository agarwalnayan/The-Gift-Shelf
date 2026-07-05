import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import Loader from '../common/Loader.jsx';

const ProtectedRoute = () => {
  const { user, isLoading } = useAuth();

  if (isLoading) return <Loader fullScreen />;

  if (!user || !['admin', 'superadmin'].includes(user.role)) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
