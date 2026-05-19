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

export default function HowItWorks() {
  return (
    <div className="how-page">
      <div className="pub-blob pub-blob-1" />
      <div className="pub-blob pub-blob-2" />

      <div className="how-inner">
        <Link to="/" className="how-back-btn">
          Volver al inicio
        </Link>

        <h1 className="how-title">¿Cómo funciona?</h1>
        <p className="how-lead">
          Todo lo que necesitas saber para participar en la Porra del Mundial 2026.
        </p>

        <div className="how-section">
          <h2 className="how-section-title">Pasos para participar</h2>
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

      </div>
    </div>
  );
}
