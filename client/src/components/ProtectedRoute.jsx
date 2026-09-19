import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function ProtectedRoute({ children, requiredRole }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-agri-600" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (requiredRole && user.role !== requiredRole) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <span className="text-5xl">🚫</span>
        <h2 className="mt-4 text-xl font-bold text-gray-700">Access Denied</h2>
        <p className="mt-2 text-gray-500">This page is only for {requiredRole}s.</p>
      </div>
    );
  }

  return children;
}
