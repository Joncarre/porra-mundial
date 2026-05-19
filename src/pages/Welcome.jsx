import { Link, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Welcome() {
  const { user, loading } = useAuth();

  if (loading) return <div className="spinner-wrap"><div className="spinner" /></div>;
  if (user) return <Navigate to="/clasificacion" replace />;

  return (
    <div className="pub-bg">
      <div className="pub-blob pub-blob-1" />
      <div className="pub-blob pub-blob-2" />
      <div className="pub-blob pub-blob-3" />

      <div className="glass-card welcome-glass">
        <h1 className="welcome-glass-title">
          Porra del
          <span className="title-accent">Mundial 2026</span>
        </h1>

        <p className="welcome-glass-sub">
          Predice los resultados, compite con tus amigos
          y sigue la clasificación en tiempo real.
        </p>

        <div className="welcome-chips">
          <div className="welcome-chip chip-violet">
            <div className="welcome-chip-value">48</div>
            <div className="welcome-chip-label">Equipos</div>
          </div>
          <div className="welcome-chip chip-sky">
            <div className="welcome-chip-value">104</div>
            <div className="welcome-chip-label">Partidos</div>
          </div>
          <div className="welcome-chip chip-emerald">
            <div className="welcome-chip-value">39</div>
            <div className="welcome-chip-label">Días</div>
          </div>
          <div className="welcome-chip chip-amber">
            <div className="welcome-chip-value">12</div>
            <div className="welcome-chip-label">Grupos</div>
          </div>
        </div>

        <hr className="welcome-glass-divider" />

        <div className="welcome-glass-cta">
          <Link to="/login" className="btn-pub-primary">
            Iniciar Sesión
          </Link>
          <Link to="/register" className="btn-pub-secondary">
            Crear cuenta
          </Link>
        </div>

        <div className="welcome-link-row">
          <Link to="/como-funciona">¿Cómo funciona la porra?</Link>
        </div>

        <div className="welcome-dates-footer">
          <span className="date-pill">11 junio</span>
          <span className="date-sep">—</span>
          <span className="date-pill">19 julio</span>
        </div>
      </div>
    </div>
  );
}
