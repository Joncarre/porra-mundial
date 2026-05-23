import { Link } from 'react-router-dom';
import {
  ArrowLeft,
  UserPlus,
  ClipboardList,
  Trophy,
  BarChart3,
  Target,
  Award,
  Medal,
  Crown,
  CheckCircle2,
} from 'lucide-react';
import {
  PUNTOS_DESCRIPCION_FASE1,
  PUNTOS_DESCRIPCION_FASE2,
  TORNEO,
} from '../data/puntuacion.js';
import './HowItWorks.css';

const PASOS = [
  {
    icon: UserPlus,
    titulo: 'Regístrate en la porra',
    detalle:
      'Crea tu cuenta con tus datos personales, elige un nickname y una contraseña. Te servirán para iniciar sesión durante todo el torneo.',
  },
  {
    icon: ClipboardList,
    titulo: 'Rellena tu fase de grupos',
    detalle:
      'Apunta el resultado de los 72 partidos de la fase de grupos y elige tu máximo goleador, Balón de Oro, de Plata y de Bronce. Una vez que pulses "Guardar grupos", quedan bloqueados.',
  },
  {
    icon: Trophy,
    titulo: 'Completa el bracket eliminatorio',
    detalle:
      'El 28 de junio se publican los 32 clasificados. Entonces se desbloquea la segunda plantilla y tendrás que completar los cruces hasta la final, además de 3.º y 4.º puesto y ganador.',
  },
  {
    icon: BarChart3,
    titulo: 'Consulta la clasificación en vivo',
    detalle:
      'A medida que el admin actualice los resultados reales, la tabla de la porra se irá moviendo automáticamente con los puntos de cada participante.',
  },
];

export default function HowItWorks() {
  return (
    <div className="hiw">
      {/* ---------- Header ---------- */}
      <header className="hiw-header">
        <div className="container hiw-header-inner">
          <Link to="/" className="btn btn-ghost">
            <ArrowLeft size={16} /> Volver
          </Link>
          <Link to="/" className="hiw-brand">
            <div className="hiw-brand-mark">
              <Trophy size={18} strokeWidth={2.5} />
            </div>
            <span>Porra <span className="text-gold">Mundial</span></span>
          </Link>
          <Link to="/register" className="btn btn-primary">Crear cuenta</Link>
        </div>
      </header>

      {/* ---------- Hero ---------- */}
      <section className="hiw-hero">
        <div className="container-narrow text-center">
          <span className="badge">¿Cómo funciona?</span>
          <h1 className="hiw-hero-title">
            La porra del <span className="text-gold">Mundial 2026</span>,
            explicada en cuatro pasos.
          </h1>
          <p className="hiw-hero-sub">
            Del {TORNEO.fechaInicio} al {TORNEO.fechaFin}, {TORNEO.totalEquipos} equipos,
            {' '}{TORNEO.totalPartidos} partidos. Todo lo que tienes que saber para
            entrar en juego con tus amigos.
          </p>
        </div>
      </section>

      {/* ---------- Pasos ---------- */}
      <section className="hiw-section">
        <div className="container">
          <div className="hiw-steps">
            {PASOS.map((paso, i) => {
              const Icon = paso.icon;
              return (
                <div key={paso.titulo} className="hiw-step">
                  <div className="hiw-step-number">{String(i + 1).padStart(2, '0')}</div>
                  <div className="hiw-step-icon"><Icon size={22} /></div>
                  <div className="hiw-step-body">
                    <h3>{paso.titulo}</h3>
                    <p>{paso.detalle}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ---------- Sistema de puntos ---------- */}
      <section className="hiw-section hiw-section-alt">
        <div className="container">
          <div className="hiw-block-header">
            <span className="badge">Sistema de puntos</span>
            <h2>Cada acierto cuenta</h2>
            <p>
              Estos son los puntos que puedes conseguir en cada fase de la porra.
              Cuanto más certero seas, más subirás en la clasificación.
            </p>
          </div>

          {/* Fase 1 */}
          <div className="hiw-points-block">
            <div className="hiw-points-heading">
              <Target size={20} />
              <h3>Fase de grupos</h3>
            </div>
            <div className="hiw-points-grid">
              {PUNTOS_DESCRIPCION_FASE1.map((p) => (
                <div key={p.titulo} className="hiw-point card">
                  <div className="hiw-point-value">{p.valor}</div>
                  <div className="hiw-point-title">{p.titulo}</div>
                  <p className="hiw-point-detail">{p.detalle}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Fase 2 */}
          <div className="hiw-points-block">
            <div className="hiw-points-heading">
              <Trophy size={20} />
              <h3>Fase eliminatoria</h3>
            </div>
            <div className="hiw-points-grid">
              {PUNTOS_DESCRIPCION_FASE2.map((p) => (
                <div key={p.titulo} className="hiw-point card">
                  <div className="hiw-point-value">{p.valor}</div>
                  <div className="hiw-point-title">{p.titulo}</div>
                  <p className="hiw-point-detail">{p.detalle}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ---------- Resumen visual de premios ---------- */}
      <section className="hiw-section">
        <div className="container">
          <div className="hiw-block-header">
            <span className="badge">Premios individuales</span>
            <h2>El reconocimiento personal</h2>
            <p>
              Más allá de los partidos, hay puntos extra reservados para los
              que acierten a los jugadores más destacados del Mundial.
            </p>
          </div>

          <div className="hiw-prizes">
            <div className="hiw-prize card">
              <Award size={28} className="hiw-prize-icon hiw-prize-icon--gold" />
              <div>
                <h4>Balón de Oro</h4>
                <span className="hiw-prize-pts">+20 pts</span>
              </div>
            </div>
            <div className="hiw-prize card">
              <Award size={28} className="hiw-prize-icon hiw-prize-icon--silver" />
              <div>
                <h4>Balón de Plata</h4>
                <span className="hiw-prize-pts">+20 pts</span>
              </div>
            </div>
            <div className="hiw-prize card">
              <Award size={28} className="hiw-prize-icon hiw-prize-icon--bronze" />
              <div>
                <h4>Balón de Bronce</h4>
                <span className="hiw-prize-pts">+20 pts</span>
              </div>
            </div>
            <div className="hiw-prize card">
              <Medal size={28} className="hiw-prize-icon hiw-prize-icon--gold" />
              <div>
                <h4>Máximo goleador</h4>
                <span className="hiw-prize-pts">+10 pts</span>
              </div>
            </div>
            <div className="hiw-prize card">
              <Crown size={28} className="hiw-prize-icon hiw-prize-icon--gold" />
              <div>
                <h4>Ganador del Mundial</h4>
                <span className="hiw-prize-pts">+10 pts</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ---------- CTA final ---------- */}
      <section className="hiw-cta">
        <div className="container-narrow text-center">
          <div className="hiw-cta-card card-elevated">
            <CheckCircle2 size={36} className="hiw-cta-icon" />
            <h2>¿Listo para entrar?</h2>
            <p>
              Regístrate y empieza a rellenar tus pronósticos antes de que
              ruede el balón en el primer partido.
            </p>
            <div className="hiw-cta-actions">
              <Link to="/register" className="btn btn-primary btn-lg">Crear cuenta</Link>
              <Link to="/login" className="btn btn-secondary btn-lg">Iniciar sesión</Link>
            </div>
          </div>
        </div>
      </section>

      {/* ---------- Footer ---------- */}
      <footer className="hiw-footer">
        <div className="container hiw-footer-inner">
          <span className="text-muted">© 2026 Porra Mundial · Hecho entre amigos</span>
          <Link to="/" className="hiw-footer-link">Volver al inicio</Link>
        </div>
      </footer>
    </div>
  );
}
