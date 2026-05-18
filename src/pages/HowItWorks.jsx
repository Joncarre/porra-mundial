import { Link } from 'react-router-dom';

const STEPS = [
  {
    title: 'Regístrate',
    desc: 'Crea tu cuenta con tu nombre, email, nickname y contraseña. El nickname es el nombre que verán el resto de participantes en la clasificación.',
  },
  {
    title: 'Rellena la fase de grupos',
    desc: 'Antes del inicio del torneo, predice el resultado exacto (goles) de los 72 partidos de la fase de grupos, elige al máximo goleador y al Balón de Oro (oro, plata y bronce).',
  },
  {
    title: 'Espera la apertura de eliminatorias',
    desc: 'A partir del 28 de junio, tras concluir la fase de grupos, el administrador abrirá la fase eliminatoria para que puedas completar tu bracket.',
  },
  {
    title: 'Completa el bracket eliminatorio',
    desc: 'Predice los ganadores de todos los cruces eliminatorios: dieciseisavos, octavos, cuartos de final, semifinales, tercer puesto y la gran final.',
  },
  {
    title: 'Sigue la clasificación',
    desc: 'A medida que se juegan los partidos, el administrador introduce los resultados y tu puntuación se actualiza automáticamente. Consulta el ranking para ver cómo vas.',
  },
];

const SCORING_GROUPS = [
  { label: 'Ganador del partido', pts: '+1 pt' },
  { label: 'Resultado exacto', pts: '+3 pts' },
  { label: 'Máximo goleador', pts: '+4 pts' },
  { label: 'Balón de Oro', pts: '+3 pts' },
  { label: 'Balón de Plata', pts: '+2 pts' },
  { label: 'Balón de Bronce', pts: '+1 pt' },
];

const SCORING_KO = [
  { label: 'Dieciseisavos — ganador', pts: '+2 pts' },
  { label: 'Dieciseisavos — exacto', pts: '+5 pts' },
  { label: 'Octavos — ganador', pts: '+3 pts' },
  { label: 'Octavos — exacto', pts: '+6 pts' },
  { label: 'Cuartos — ganador', pts: '+4 pts' },
  { label: 'Cuartos — exacto', pts: '+8 pts' },
  { label: 'Semifinales — ganador', pts: '+5 pts' },
  { label: 'Semifinales — exacto', pts: '+10 pts' },
  { label: 'Final — ganador', pts: '+6 pts' },
  { label: 'Final — exacto', pts: '+12 pts' },
];

const RULES = [
  {
    title: 'Plazo de predicciones',
    desc: 'Las predicciones de la fase de grupos deben completarse antes del inicio del primer partido (11 de junio). Una vez comenzado el torneo, las predicciones se bloquean.',
  },
  {
    title: 'Puntuación exacta',
    desc: 'El resultado exacto incluye los puntos del ganador. No se acumulan: acertar el resultado exacto da 3 puntos en total en fase de grupos, no 1+3.',
  },
  {
    title: 'Administración',
    desc: 'El administrador introduce los resultados oficiales y gestiona la apertura de fases. En caso de discrepancia, el criterio del administrador es definitivo.',
  },
];

export default function HowItWorks() {
  return (
    <div className="how-page">
      <div className="pub-blob pub-blob-1" />
      <div className="pub-blob pub-blob-2" />

      <div className="how-inner">
        <Link to="/" className="how-back-btn">
          ← Volver al inicio
        </Link>

        <h1 className="how-title">¿Cómo funciona?</h1>
        <p className="how-lead">
          Todo lo que necesitas saber para participar en la Porra del Mundial 2026.
        </p>

        <div className="how-section">
          <h2 className="how-section-title">📋 Pasos para participar</h2>
          <div className="how-steps-list">
            {STEPS.map((step, i) => (
              <div className="how-step" key={i}>
                <div className="how-step-num">{i + 1}</div>
                <div className="how-step-content">
                  <h4>{step.title}</h4>
                  <p>{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="how-section">
          <h2 className="how-section-title">🏆 Sistema de puntuación</h2>
          <div className="scoring-grid">
            <div>
              <p className="scoring-sub">Fase de grupos</p>
              {SCORING_GROUPS.map((r) => (
                <div className="scoring-row" key={r.label}>
                  <span className="scoring-row-label">{r.label}</span>
                  <span className="scoring-row-pts">{r.pts}</span>
                </div>
              ))}
            </div>
            <div>
              <p className="scoring-sub">Fase eliminatoria</p>
              {SCORING_KO.map((r) => (
                <div className="scoring-row" key={r.label}>
                  <span className="scoring-row-label">{r.label}</span>
                  <span className="scoring-row-pts">{r.pts}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="how-section">
          <h2 className="how-section-title">📌 Reglas importantes</h2>
          <div className="how-steps-list">
            {RULES.map((r) => (
              <div className="how-step" key={r.title}>
                <div className="how-step-num" style={{ background: '#f59e0b', boxShadow: '0 2px 8px rgba(245,158,11,0.35)' }}>!</div>
                <div className="how-step-content">
                  <h4>{r.title}</h4>
                  <p>{r.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
