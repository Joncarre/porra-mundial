import { useState, useEffect } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase/config';
import { getBandera } from '../data/worldcup2026';
import { RefreshCw, GitMerge, Lock } from 'lucide-react';

function MatchCard({ match, label }) {
  const { team1 = '', team2 = '', g1, g2 } = match || {};
  const hasResult = g1 !== undefined && g1 !== null && g1 !== '';

  let winnerTeam = null;
  if (hasResult) {
    winnerTeam = Number(g1) > Number(g2) ? team1 : Number(g2) > Number(g1) ? team2 : null;
  }

  return (
    <div style={{
      background: 'var(--bg-card)',
      border: '1px solid var(--border)',
      borderRadius: 'var(--r-md)',
      overflow: 'hidden',
    }}>
      {label && (
        <div style={{ padding: '0.3rem 0.875rem', background: 'var(--bg-card-hover)', fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
          {label}
        </div>
      )}
      {[
        { team: team1, goals: g1, isWinner: team1 && winnerTeam === team1 },
        { team: team2, goals: g2, isWinner: team2 && winnerTeam === team2 },
      ].map(({ team, goals, isWinner }, i) => (
        <div key={i} style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          padding: '0.5rem 0.875rem',
          borderBottom: i === 0 ? '1px solid var(--border-2)' : 'none',
          background: isWinner ? 'var(--gold-light)' : 'transparent',
          transition: 'background 0.15s',
        }}>
          <span style={{ fontSize: '1rem' }}>{team ? getBandera(team) : '🏳️'}</span>
          <span style={{
            flex: 1,
            fontSize: '0.875rem',
            fontWeight: isWinner ? 700 : 400,
            color: team ? 'var(--text)' : 'var(--text-3)',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}>
            {team || 'Por determinar'}
          </span>
          <span style={{
            fontWeight: 800,
            fontSize: '0.9375rem',
            color: isWinner ? 'var(--gold)' : 'var(--text-2)',
            minWidth: '1.25rem',
            textAlign: 'right',
          }}>
            {hasResult ? goals : '—'}
          </span>
        </div>
      ))}
    </div>
  );
}

const RONDAS = [
  { key: 'd32', label: 'Dieciseisavos de Final', count: 16, cols: 4 },
  { key: 'o16', label: 'Octavos de Final', count: 8, cols: 4 },
  { key: 'qf', label: 'Cuartos de Final', count: 4, cols: 4 },
  { key: 'sf', label: 'Semifinales', count: 2, cols: 2 },
];

export default function Brackets() {
  const [config, setConfig] = useState(null);
  const [resultados, setResultados] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    setLoading(true);
    try {
      const [configSnap, resSnap] = await Promise.all([
        getDoc(doc(db, 'torneo', 'config')),
        getDoc(doc(db, 'resultados', 'eliminatoria')),
      ]);
      setConfig(configSnap.exists() ? configSnap.data() : {});
      setResultados(resSnap.exists() ? resSnap.data() : {});
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, []);

  if (loading) return <div className="spinner-wrap"><div className="spinner" /></div>;

  const fase2Habilitada = config?.fase2Habilitada;

  return (
    <div className="page">
      <div className="container">
        <div className="page-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h1>Fase Eliminatoria</h1>
            <p>Bracket oficial del Mundial 2026</p>
          </div>
          <button className="btn btn-ghost btn-sm" onClick={loadData}>
            <RefreshCw size={14} />
            Actualizar
          </button>
        </div>

        {!fase2Habilitada ? (
          <div className="card" style={{ textAlign: 'center', padding: '3rem 2rem' }}>
            <Lock size={40} color="var(--text-3)" style={{ margin: '0 auto 1rem' }} />
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.75rem' }}>
              Fase eliminatoria no disponible todavía
            </h3>
            <p style={{ color: 'var(--text-2)', maxWidth: 440, margin: '0 auto' }}>
              La fase eliminatoria se habilitará el <strong>28 de junio de 2026</strong>,
              una vez que concluya la fase de grupos y el administrador configure los enfrentamientos.
            </p>
          </div>
        ) : (
          <>
            {RONDAS.map(({ key, label, count, cols }) => {
              const matches = resultados?.[key] || config?.d32Matchups || [];
              const displayMatches = key === 'd32'
                ? (config?.d32Matchups || []).map((m, i) => ({
                    ...m,
                    ...(resultados?.d32?.[i] || {}),
                  }))
                : (resultados?.[key] || Array(count).fill(null).map(() => ({ team1: '', team2: '', g1: '', g2: '' })));

              return (
                <div key={key} className="bracket-round">
                  <div className="bracket-round-title">
                    <GitMerge size={14} />
                    {label}
                  </div>
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: `repeat(${Math.min(cols, count)}, 1fr)`,
                    gap: '0.75rem',
                  }}>
                    {displayMatches.slice(0, count).map((match, idx) => (
                      <MatchCard
                        key={idx}
                        match={match || {}}
                        label={`Partido ${idx + 1}`}
                      />
                    ))}
                  </div>
                </div>
              );
            })}

            {/* Tercer puesto y Final */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginTop: '0.5rem' }}>
              <div className="bracket-round">
                <div className="bracket-round-title">🥉 Tercer y Cuarto Puesto</div>
                <MatchCard match={resultados?.tercerPuesto || config?.tercerPuesto || {}} />
              </div>
              <div className="bracket-round">
                <div className="bracket-round-title">🏆 Final</div>
                <div style={{
                  border: '1px solid rgba(245,177,0,0.3)',
                  borderRadius: 'var(--r-lg)',
                  overflow: 'hidden',
                  background: 'linear-gradient(135deg, rgba(245,177,0,0.06), var(--bg-card))',
                }}>
                  <MatchCard match={resultados?.final || config?.final || {}} />
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
