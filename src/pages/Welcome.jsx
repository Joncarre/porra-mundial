import { Link } from 'react-router-dom';
import { Trophy, Users, Calendar, ArrowRight, Sparkles, Target, BarChart3, User } from 'lucide-react';
import { TORNEO } from '../data/puntuacion.js';
import { useAuth } from '../context/AuthContext.jsx';
import Avatar from '../components/Avatar.jsx';
import './Welcome.css';

export default function Welcome() {
  const { user } = useAuth();
  const isLoggedIn = !!user;

  return (
    <div className="welcome">
      {/* ---------- Header ---------- */}
      <header className="welcome-header">
        <div className="container welcome-header-inner">
          <Link to="/" className="welcome-brand">
            <div className="welcome-brand-mark">
              <Trophy size={20} strokeWidth={2.5} />
            </div>
            <span className="welcome-brand-text">
              Porra <span className="text-gold">Mundial</span>
            </span>
          </Link>
          <nav className="welcome-nav">
            <Link to="/how-it-works" className="btn btn-ghost">¿Cómo funciona?</Link>
            {isLoggedIn ? (
              <Link to="/perfil" className="welcome-nav-user">
                <Avatar id={user.avatarId} size="sm" />
                <span className="welcome-nav-nick">{user.nickname}</span>
              </Link>
            ) : (
              <Link to="/login" className="btn btn-secondary">Iniciar sesión</Link>
            )}
          </nav>
        </div>
      </header>

      {/* ---------- Hero ---------- */}
      <section className="welcome-hero">
        <div className="container welcome-hero-inner">
          <div className="welcome-hero-content animate-fade-up">
            <span className="badge">
              <Sparkles size={12} /> Mundial 2026 · USA · México · Canadá
            </span>
            <h1 className="welcome-hero-title">
              Predice, compite y gana<br />
              con <span className="text-gold">tus amigos</span>.
            </h1>
            <p className="welcome-hero-subtitle">
              La porra más elegante del Mundial 2026. Rellena tus pronósticos
              para la fase de grupos y el bracket eliminatorio, y sube puestos
              en la clasificación con cada acierto.
            </p>
            <div className="welcome-hero-actions">
              {isLoggedIn ? (
                <Link to="/perfil" className="btn btn-primary btn-lg">
                  <User size={18} /> Ir a mi perfil
                  <ArrowRight size={18} />
                </Link>
              ) : (
                <>
                  <Link to="/register" className="btn btn-primary btn-lg">
                    Crear cuenta
                    <ArrowRight size={18} />
                  </Link>
                  <Link to="/login" className="btn btn-secondary btn-lg">
                    Iniciar sesión
                  </Link>
                </>
              )}
            </div>
            <Link to="/how-it-works" className="welcome-hero-link">
              ¿Cómo funciona esta porra? <ArrowRight size={14} />
            </Link>
          </div>

          {/* Decorative trophy mark */}
          <div className="welcome-hero-deco" aria-hidden="true">
            <div className="welcome-hero-glow" />
            <div className="welcome-hero-trophy">
              <Trophy size={140} strokeWidth={1.2} />
            </div>
          </div>
        </div>
      </section>

      {/* ---------- Stats ---------- */}
      <section className="welcome-stats-section">
        <div className="container">
          <div className="welcome-stats">
            <div className="welcome-stat card">
              <Users size={24} className="welcome-stat-icon" />
              <div className="welcome-stat-value">{TORNEO.totalEquipos}</div>
              <div className="welcome-stat-label">Equipos participantes</div>
            </div>
            <div className="welcome-stat card">
              <Trophy size={24} className="welcome-stat-icon" />
              <div className="welcome-stat-value">{TORNEO.totalPartidos}</div>
              <div className="welcome-stat-label">Partidos en juego</div>
            </div>
            <div className="welcome-stat card">
              <Calendar size={24} className="welcome-stat-icon" />
              <div className="welcome-stat-value">11 JUN – 19 JUL</div>
              <div className="welcome-stat-label">Del primer pitido a la final</div>
            </div>
          </div>
        </div>
      </section>

      {/* ---------- How it works (preview) ---------- */}
      <section className="welcome-features">
        <div className="container">
          <div className="welcome-features-header">
            <span className="badge">Cómo participas</span>
            <h2>Tres pasos para entrar al juego</h2>
            <p className="welcome-features-sub">
              Una porra completa pero sencilla: predices, esperas, compites.
            </p>
          </div>

          <div className="welcome-features-grid">
            <div className="welcome-feature card">
              <div className="welcome-feature-num">01</div>
              <Target size={28} className="welcome-feature-icon" />
              <h3>Rellena la fase de grupos</h3>
              <p>
                Pronostica los 72 partidos de la fase de grupos y elige al
                máximo goleador y a los balones de oro, plata y bronce.
              </p>
            </div>
            <div className="welcome-feature card">
              <div className="welcome-feature-num">02</div>
              <Trophy size={28} className="welcome-feature-icon" />
              <h3>Completa tu bracket</h3>
              <p>
                Cuando se decidan los 32 clasificados (28 de junio), rellena
                tu cuadro eliminatorio hasta la gran final.
              </p>
            </div>
            <div className="welcome-feature card">
              <div className="welcome-feature-num">03</div>
              <BarChart3 size={28} className="welcome-feature-icon" />
              <h3>Sube en la clasificación</h3>
              <p>
                Cada acierto te suma puntos. Consulta la tabla en vivo y
                descubre quién va liderando la porra hasta el último minuto.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ---------- Footer ---------- */}
      <footer className="welcome-footer">
        <div className="container welcome-footer-inner">
          <span className="text-muted">© 2026 Porra Mundial · Hecho entre amigos</span>
          <Link to="/how-it-works" className="welcome-footer-link">
            ¿Cómo funciona?
          </Link>
        </div>
      </footer>
    </div>
  );
}
