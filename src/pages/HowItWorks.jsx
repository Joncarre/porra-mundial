import { Link } from 'react-router-dom';
import {
  PUNTOS_DESCRIPCION_FASE1,
  PUNTOS_DESCRIPCION_FASE2,
  TORNEO,
} from '../data/puntuacion.js';
import './HowItWorks.css';

const PASOS = [
  {
    titulo: 'Regístrate y paga',
    detalle:
      'Crea tu cuenta con tu nickname y contraseña, y haz el bizum de la cuota al administrador.',
  },
  {
    titulo: 'El admin confirma tu pago',
    detalle:
      'Cuando el administrador reciba tu aportación, te marcará como pagado y se te desbloqueará la porra.',
  },
  {
    titulo: 'Rellena la fase de grupos',
    detalle:
      'Pronostica el resultado de los 72 partidos de la fase de grupos.',
  },
  {
    titulo: 'Completa el bracket eliminatorio',
    detalle:
      'A partir de tus propios pronósticos de grupos, el sistema te guía con los equipos posibles hasta la final.',
  },
  {
    titulo: 'Rellena las apuestas extra',
    detalle:
      'Elige al máximo goleador y a los balones de oro, plata y bronce del Mundial.',
  },
  {
    titulo: 'Consulta la clasificación',
    detalle:
      'A medida que el administrador actualice los resultados reales, la tabla se mueve automáticamente con los puntos de cada participante.',
  },
];

export default function HowItWorks() {
  return (
    <div className="hiw">
      <div className="container">
        <Link to="/" className="hiw-back">&larr; Volver al inicio</Link>
      </div>

      {/* ---------- Hero ---------- */}
      <section className="hiw-hero">
        <div className="container-narrow text-center">
          <span className="eyebrow">¿Cómo funciona?</span>
          <h1 className="hiw-hero-title">
            La porra del <span className="text-gold">Mundial 2026</span>,
            explicada paso a paso.
          </h1>
          <p className="hiw-hero-sub">
            Del {TORNEO.fechaInicio} al {TORNEO.fechaFin}, {TORNEO.totalEquipos} equipos
            y {TORNEO.totalPartidos} partidos. Todo lo que tienes que saber para entrar
            en juego con tus amigos.
          </p>
        </div>
      </section>

      {/* ---------- Pasos ---------- */}
      <section className="hiw-section">
        <div className="container">
          <div className="hiw-steps">
            {PASOS.map((paso, i) => (
              <div key={paso.titulo} className="hiw-step">
                <div className="hiw-step-number">{String(i + 1).padStart(2, '0')}</div>
                <h3 className="hiw-step-title">{paso.titulo}</h3>
                <p className="hiw-step-text">{paso.detalle}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ---------- Sistema de puntos ---------- */}
      <section className="hiw-section hiw-section-alt">
        <div className="container">
          <div className="hiw-block-header">
            <span className="eyebrow">Sistema de puntos</span>
            <h2>Cada acierto cuenta</h2>
          </div>

          <div className="hiw-points-cards">
            <div className="hiw-points-card">
              <div className="hiw-points-card-head">
                <span className="hiw-points-card-num">01</span>
                <h3>Fase de grupos</h3>
              </div>
              <ul className="hiw-points-list">
                {PUNTOS_DESCRIPCION_FASE1.map((p) => (
                  <li key={p.titulo} className="hiw-points-row">
                    <span className="hiw-points-label">{p.titulo}</span>
                    <span className="hiw-points-leader" aria-hidden="true" />
                    <span className="hiw-points-value">{p.valor}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="hiw-points-card">
              <div className="hiw-points-card-head">
                <span className="hiw-points-card-num">02</span>
                <h3>Fase eliminatoria</h3>
              </div>
              <ul className="hiw-points-list">
                {PUNTOS_DESCRIPCION_FASE2.map((p) => (
                  <li key={p.titulo} className="hiw-points-row">
                    <span className="hiw-points-label">{p.titulo}</span>
                    <span className="hiw-points-leader" aria-hidden="true" />
                    <span className="hiw-points-value">{p.valor}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
