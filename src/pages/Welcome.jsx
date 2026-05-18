import { Link, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Welcome() {
  const { user, loading } = useAuth();

  if (loading) return <div className="spinner-wrap"><div className="spinner" /></div>;
  if (user) return <Navigate to="/clasificacion" replace />;

  return (
    <div className="welcome-hero">
      <div className="welcome-inner">
        <div className="welcome-badge">
          ⚽ &nbsp; Mundial de Fútbol 2026
        </div>

        <h1 className="welcome-title">
          ¡Participa en la
          <span className="highlight">Porra del Mundial!</span>
        </h1>

        <p className="welcome-subtitle">
          Predice los resultados del Mundial 2026, compite con tus amigos y
          sigue la clasificación en tiempo real. 48 equipos, 104 partidos, 29 días
          de fútbol del <strong>11 de junio al 19 de julio de 2026</strong>.
        </p>

        <div className="welcome-cta-group">
          <Link to="/login" className="btn btn-primary btn-lg">
            Iniciar Sesión
          </Link>
          <Link to="/register" className="btn btn-ghost btn-lg">
            Crear cuenta
          </Link>
        </div>

        {/* Stats */}
        <div className="welcome-stats">
          {[
            { value: '48', label: 'Equipos' },
            { value: '104', label: 'Partidos' },
            { value: '29', label: 'Días' },
            { value: '12', label: 'Grupos' },
          ].map((s) => (
            <div key={s.label} className="welcome-stat">
              <div className="welcome-stat-value">{s.value}</div>
              <div className="welcome-stat-label">{s.label}</div>
            </div>
          ))}
        </div>

        {/* How it works */}
        <div className="welcome-info">
          <h3>¿Cómo funciona?</h3>
          <div className="steps-grid">
            <div className="step">
              <div className="step-num">1</div>
              <div className="step-content">
                <h4>Regístrate</h4>
                <p>Crea tu cuenta con tu nickname y contraseña para participar en la porra.</p>
              </div>
            </div>
            <div className="step">
              <div className="step-num">2</div>
              <div className="step-content">
                <h4>Rellena la fase de grupos</h4>
                <p>Predice los 72 partidos de la fase de grupos, el máximo goleador y el Balón de Oro.</p>
              </div>
            </div>
            <div className="step">
              <div className="step-num">3</div>
              <div className="step-content">
                <h4>Plantilla eliminatorias</h4>
                <p>A partir del 28 de junio, predice los resultados del bracket eliminatorio completo.</p>
              </div>
            </div>
            <div className="step">
              <div className="step-num">4</div>
              <div className="step-content">
                <h4>Sigue la clasificación</h4>
                <p>Consulta en tiempo real cómo evoluciona tu posición conforme se van jugando los partidos.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Scoring summary */}
        <div className="card" style={{ marginTop: '1.25rem', textAlign: 'left' }}>
          <div className="card-title"><span className="icon">🏆</span> Sistema de puntuación</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.875rem' }}>
            <div>
              <p className="section-label" style={{ marginBottom: '0.5rem' }}>Fase de Grupos</p>
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                <li style={{ fontSize: '0.875rem', color: 'var(--text-2)', display: 'flex', justifyContent: 'space-between' }}>
                  <span>Ganador del partido</span><span style={{ color: 'var(--gold)', fontWeight: 700 }}>+1 pt</span>
                </li>
                <li style={{ fontSize: '0.875rem', color: 'var(--text-2)', display: 'flex', justifyContent: 'space-between' }}>
                  <span>Resultado exacto</span><span style={{ color: 'var(--gold)', fontWeight: 700 }}>+3 pts</span>
                </li>
                <li style={{ fontSize: '0.875rem', color: 'var(--text-2)', display: 'flex', justifyContent: 'space-between' }}>
                  <span>Máximo goleador</span><span style={{ color: 'var(--gold)', fontWeight: 700 }}>+4 pts</span>
                </li>
                <li style={{ fontSize: '0.875rem', color: 'var(--text-2)', display: 'flex', justifyContent: 'space-between' }}>
                  <span>Balón de Oro / Plata / Bronce</span><span style={{ color: 'var(--gold)', fontWeight: 700 }}>+3/2/1 pts</span>
                </li>
              </ul>
            </div>
            <div>
              <p className="section-label" style={{ marginBottom: '0.5rem' }}>Fase Eliminatoria</p>
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                {[
                  { round: 'Dieciseisavos', w: 2, e: 5 },
                  { round: 'Octavos', w: 3, e: 6 },
                  { round: 'Cuartos', w: 4, e: 8 },
                  { round: 'Semifinales', w: 5, e: 10 },
                  { round: '3er puesto / Final', w: '4/6', e: '8/12' },
                ].map((r) => (
                  <li key={r.round} style={{ fontSize: '0.875rem', color: 'var(--text-2)', display: 'flex', justifyContent: 'space-between', gap: '0.5rem' }}>
                    <span>{r.round}</span>
                    <span style={{ color: 'var(--gold)', fontWeight: 700, whiteSpace: 'nowrap' }}>
                      +{r.w} / +{r.e} pts
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
