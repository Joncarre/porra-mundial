import { Link } from 'react-router-dom';
import { TORNEO } from '../data/puntuacion.js';
import { useAuth } from '../context/AuthContext.jsx';
import Avatar from '../components/Avatar.jsx';
import './Welcome.css';

export default function Welcome() {
  const { user } = useAuth();
  const isLoggedIn = !!user;

  return (
    <div className="welcome">
      {/* ---------- Hero ---------- */}
      <section className="welcome-hero">
        <div className="container-narrow welcome-hero-inner animate-fade-up">
          <span className="eyebrow">Mundial 2026</span>
          <h1 className="welcome-hero-title">
            Predice, apuesta y gana<br />
            la porra del <span className="text-gold">Mundial 2026</span>.
          </h1>
          <p className="welcome-hero-subtitle">
            La porra más elegante del Mundial 2026. Rellena tus pronósticos
            para la fase de grupos y el bracket eliminatorio, y sube puestos
            en la clasificación con cada acierto.
          </p>
          <div className="welcome-hero-actions">
            {isLoggedIn ? (
              <Link to="/perfil" className="welcome-user-chip">
                <Avatar foto={user.avatarFoto} name={user.nombre || user.nickname} size="sm" />
                <span className="welcome-user-text">
                  Continuar como <strong>{user.nickname}</strong>
                </span>
              </Link>
            ) : (
              <>
                <Link to="/register" className="btn btn-primary btn-lg">
                  Crear cuenta
                </Link>
                <Link to="/login" className="btn btn-secondary btn-lg welcome-login-btn">
                  Iniciar sesión
                </Link>
              </>
            )}
          </div>
          <Link to="/how-it-works" className="welcome-hero-link">
            <span className="welcome-hero-link-rule" aria-hidden="true" />
            <span>¿Cómo funciona esta porra?</span>
            <span className="welcome-hero-link-rule" aria-hidden="true" />
          </Link>
        </div>
      </section>

      {/* ---------- Stats ---------- */}
      <section className="welcome-stats-section">
        <div className="container">
          <div className="welcome-stats">
            <div className="welcome-stat">
              <div className="welcome-stat-value">{TORNEO.totalEquipos}</div>
              <div className="welcome-stat-label">Equipos participantes</div>
            </div>
            <div className="welcome-stat-divider" />
            <div className="welcome-stat">
              <div className="welcome-stat-value">{TORNEO.totalPartidos}</div>
              <div className="welcome-stat-label">Partidos en juego</div>
            </div>
            <div className="welcome-stat-divider" />
            <div className="welcome-stat">
              <div className="welcome-stat-value">11 jun &mdash; 19 jul</div>
              <div className="welcome-stat-label">Días de máxima rivalidad</div>
            </div>
          </div>
        </div>
      </section>

      <footer className="welcome-footer">
        <p className="welcome-credit">
          Desarrollado por
          <a
            className="welcome-credit-link"
            href="https://github.com/Joncarre"
            target="_blank"
            rel="noopener noreferrer"
          >
            <img
              src="/github.svg"
              alt=""
              className="welcome-credit-logo"
              aria-hidden="true"
            />
            <span>Joncarre</span>
          </a>
        </p>
      </footer>
    </div>
  );
}
