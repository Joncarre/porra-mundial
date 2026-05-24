import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

/**
 * Envoltorio para rutas privadas.
 * - Sin usuario logueado → /login conservando el destino original.
 * - `requireAdmin` → redirige a /perfil si el usuario no es admin.
 * - `forbidAdmin` → redirige a /perfil si SÍ es admin (rutas de
 *   participante en las que el admin no tiene sentido).
 */
export default function ProtectedRoute({ children, requireAdmin = false, forbidAdmin = false }) {
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

  if (forbidAdmin && user.isAdmin) {
    return <Navigate to="/perfil" replace />;
  }

  return children;
}
