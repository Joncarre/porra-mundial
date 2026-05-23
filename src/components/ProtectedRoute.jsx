import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

/**
 * Envoltorio para rutas privadas.
 * Si no hay usuario logueado, redirige a /login conservando el destino
 * original en el estado para poder volver tras autenticarse.
 * Con `requireAdmin`, redirige a /perfil si el usuario no es admin.
 */
export default function ProtectedRoute({ children, requireAdmin = false }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="auth-loading">
        <div className="auth-loading-spinner" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  if (requireAdmin && !user.isAdmin) {
    return <Navigate to="/perfil" replace />;
  }

  return children;
}
