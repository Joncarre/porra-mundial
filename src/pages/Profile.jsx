import { useState, useEffect, useCallback } from 'react';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase/config';
import { useAuth } from '../context/AuthContext';
import { GRUPOS, PARTIDOS_POR_GRUPO, getAcronimo } from '../data/worldcup2026';
import { getGanadorEquipo, getPerdedorEquipo } from '../utils/scoring';
import { Save, Lock, Trophy, Star, User } from 'lucide-react';

// ────────────────────────────────────────────────────────────────────────────────
// Helpers
// ────────────────────────────────────────────────────────────────────────────────

function buildEmptyFase1() {
  const partidos = {};
  Object.values(GRUPOS).forEach((g) =>
    g.equipos.forEach((_, i) =>
      g.equipos.forEach((_, j) => {
        if (i < j) {
          // IDs se generan en worldcup2026.js; los rellenamos todos como ''
        }
      })
    )
  );
  // Inicializar todas las claves de partidos vacías
  return { partidos: {}, maxGoleador: '', balonOro: '', balonPlata: '', balonBronce: '' };
}

function buildEmptyBracket(d32Matchups) {
  const d32 = (d32Matchups || []).map((m) => ({ ...m, g1: '', g2: '' }));
  const empty8 = Array(8).fill(null).map(() => ({ team1: '', team2: '', g1: '', g2: '' }));
  const empty4 = Array(4).fill(null).map(() => ({ team1: '', team2: '', g1: '', g2: '' }));
  const empty2 = Array(2).fill(null).map(() => ({ team1: '', team2: '', g1: '', g2: '' }));
  return {
    d32,
    o16: empty8,
    qf: empty4,
    sf: empty2,
    tercerPuesto: { team1: '', team2: '', g1: '', g2: '' },
    final: { team1: '', team2: '', g1: '', g2: '' },
  };
}

// Propaga ganadores desde una ronda hacia la siguiente
function propagateBracket(bracket) {
  const next = JSON.parse(JSON.stringify(bracket));

  // D32 → O16 (m1 winner vs m2 winner, etc.)
  for (let i = 0; i < 8; i++) {
    const m1 = next.d32[i * 2];
    const m2 = next.d32[i * 2 + 1];
    next.o16[i].team1 = getGanadorEquipo(m1) || '';
    next.o16[i].team2 = getGanadorEquipo(m2) || '';
  }

  // O16 → QF
  for (let i = 0; i < 4; i++) {
    const m1 = next.o16[i * 2];
    const m2 = next.o16[i * 2 + 1];
    next.qf[i].team1 = getGanadorEquipo(m1) || '';
    next.qf[i].team2 = getGanadorEquipo(m2) || '';
  }

  // QF → SF
  for (let i = 0; i < 2; i++) {
    const m1 = next.qf[i * 2];
    const m2 = next.qf[i * 2 + 1];
    next.sf[i].team1 = getGanadorEquipo(m1) || '';
    next.sf[i].team2 = getGanadorEquipo(m2) || '';
  }

  // SF → Tercer puesto
  next.tercerPuesto.team1 = getPerdedorEquipo(next.sf[0]) || '';
  next.tercerPuesto.team2 = getPerdedorEquipo(next.sf[1]) || '';

  // SF → Final
  next.final.team1 = getGanadorEquipo(next.sf[0]) || '';
  next.final.team2 = getGanadorEquipo(next.sf[1]) || '';

  return next;
}

// ────────────────────────────────────────────────────────────────────────────────
// Score input para partidos de grupos
// ────────────────────────────────────────────────────────────────────────────────
const MONO = "'IBM Plex Mono', 'Courier New', monospace";
const TEAM_COLOR = '#2a7a8c';

const ACR = { fontFamily: MONO, color: '#ef8354', fontWeight: 700, fontSize: '0.6875rem', flexShrink: 0 };

function MatchInput({ partido, value = {}, onChange, locked }) {
  const { local, visitante } = partido;
  const g1 = value.g1 ?? '';
  const g2 = value.g2 ?? '';

  const update = (field, val) => {
    const stripped = val.replace(/\D/g, '');
    if (stripped === '') { onChange({ ...value, [field]: '' }); return; }
    const num = parseInt(stripped, 10);
    if (num > 99) return;
    onChange({ ...value, [field]: num });
  };

  return (
    <div className="match-row" style={{ padding: '0.35rem 0' }}>
      <div className="match-team">
        <span style={ACR}>{getAcronimo(local)}</span>
        <span className="match-team-name" style={{ fontFamily: MONO, color: TEAM_COLOR, fontSize: '0.8125rem' }}>{local}</span>
      </div>
      <div className="match-score-center" style={{ gap: '0.25rem' }}>
        <input
          className="score-input"
          type="text"
          inputMode="numeric"
          maxLength={2}
          value={g1}
          onChange={(e) => update('g1', e.target.value)}
          disabled={locked}
        />
        <span style={{ fontSize: '0.625rem', color: '#94a3b8', fontWeight: 600, letterSpacing: '0.02em', padding: '0 0.1rem' }}>vs.</span>
        <input
          className="score-input"
          type="text"
          inputMode="numeric"
          maxLength={2}
          value={g2}
          onChange={(e) => update('g2', e.target.value)}
          disabled={locked}
        />
      </div>
      <div className="match-team right">
        {/* row-reverse: primer elemento queda a la derecha (exterior) */}
        <span style={ACR}>{getAcronimo(visitante)}</span>
        <span className="match-team-name" style={{ fontFamily: MONO, color: TEAM_COLOR, fontSize: '0.8125rem' }}>{visitante}</span>
      </div>
    </div>
  );
}

// ────────────────────────────────────────────────────────────────────────────────
// Bracket match input para eliminatoria
// ────────────────────────────────────────────────────────────────────────────────
function BracketMatchInput({ match, onChange, locked, isFirst }) {
  const { team1 = '', team2 = '', g1 = '', g2 = '' } = match || {};

  const update = (field, val) => {
    const num = val === '' ? '' : Math.max(0, parseInt(val, 10) || 0);
    onChange({ ...match, [field]: num });
  };

  return (
    <div className={`bracket-match ${locked ? 'locked' : ''}`}>
      <div className="match-row" style={{ padding: '0.5rem 0', borderBottom: '1px solid var(--border-2)' }}>
        <div className="match-team">
          {team1 && <span style={ACR}>{getAcronimo(team1)}</span>}
          <span className="match-team-name" style={{ fontSize: '0.8125rem', fontFamily: MONO, color: TEAM_COLOR }}>
            {team1 || <span style={{ color: 'var(--text-3)', fontFamily: 'inherit' }}>Por determinar</span>}
          </span>
        </div>
        <div className="match-score-center">
          {isFirst ? (
            <>
              <input
                className="score-input"
                style={{ width: '2.25rem' }}
                type="text"
                inputMode="numeric"
                maxLength={2}
                value={g1}
                onChange={(e) => update('g1', e.target.value)}
                disabled={locked || !team1 || !team2}
                placeholder="—"
              />
              <span className="score-separator">:</span>
              <input
                className="score-input"
                style={{ width: '2.25rem' }}
                type="text"
                inputMode="numeric"
                maxLength={2}
                value={g2}
                onChange={(e) => update('g2', e.target.value)}
                disabled={locked || !team1 || !team2}
                placeholder="—"
              />
            </>
          ) : (
            <span style={{ fontSize: '0.8125rem', color: 'var(--text-3)' }}>vs</span>
          )}
        </div>
        <div className="match-team right">
          {team2 && <span style={ACR}>{getAcronimo(team2)}</span>}
          <span className="match-team-name" style={{ fontSize: '0.8125rem', fontFamily: MONO, color: TEAM_COLOR }}>
            {team2 || <span style={{ color: 'var(--text-3)', fontFamily: 'inherit' }}>Por determinar</span>}
          </span>
        </div>
      </div>
    </div>
  );
}

// ────────────────────────────────────────────────────────────────────────────────
// Componente principal
// ────────────────────────────────────────────────────────────────────────────────
export default function Profile() {
  const { user } = useAuth();

  // Config del torneo
  const [torneoConfig, setTorneoConfig] = useState(null);
  // Predicciones fase 1
  const [fase1, setFase1] = useState(buildEmptyFase1());
  // Predicciones fase 2 (bracket)
  const [bracket, setBracket] = useState(null);

  const [activeGroup, setActiveGroup] = useState('A');
  const [loadingData, setLoadingData] = useState(true);
  const [saving1, setSaving1] = useState(false);
  const [saving2, setSaving2] = useState(false);
  const [msg1, setMsg1] = useState('');
  const [msg2, setMsg2] = useState('');

  // ── Cargar datos ──────────────────────────────────────────────────────────────
  useEffect(() => {
    async function loadData() {
      setLoadingData(true);
      try {
        // Config del torneo
        const configSnap = await getDoc(doc(db, 'torneo', 'config'));
        const config = configSnap.exists() ? configSnap.data() : {};
        setTorneoConfig(config);

        // Predicciones fase 1
        const f1Snap = await getDoc(doc(db, 'predicciones_fase1', user.id));
        if (f1Snap.exists()) {
          setFase1(f1Snap.data());
        }

        // Predicciones fase 2
        if (config.fase2Habilitada) {
          const f2Snap = await getDoc(doc(db, 'predicciones_fase2', user.id));
          if (f2Snap.exists()) {
            setBracket(f2Snap.data());
          } else {
            // Inicializar bracket vacío con los matchups del admin
            setBracket(buildEmptyBracket(config.d32Matchups || []));
          }
        }
      } catch (err) {
        console.error('Error cargando datos:', err);
      } finally {
        setLoadingData(false);
      }
    }
    loadData();
  }, [user.id]);

  // ── Guardar fase 1 ────────────────────────────────────────────────────────────
  const saveFase1 = async () => {
    setSaving1(true);
    setMsg1('');

    const allPartidos = Object.values(PARTIDOS_POR_GRUPO).flat();
    const hasEmpty = allPartidos.some(({ id }) => {
      const p = fase1.partidos?.[id];
      return !p || p.g1 === '' || p.g1 === undefined || p.g1 === null
                || p.g2 === '' || p.g2 === undefined || p.g2 === null;
    });
    if (hasEmpty) {
      setMsg1('Rellena todos los resultados antes de guardar.');
      setSaving1(false);
      return;
    }

    try {
      await setDoc(doc(db, 'predicciones_fase1', user.id), {
        ...fase1,
        userId: user.id,
        updatedAt: serverTimestamp(),
      });
      setMsg1('¡Guardado correctamente!');
      setTimeout(() => setMsg1(''), 3000);
    } catch {
      setMsg1('Error al guardar. Inténtalo de nuevo.');
    } finally {
      setSaving1(false);
    }
  };

  // ── Guardar fase 2 ────────────────────────────────────────────────────────────
  const saveFase2 = async () => {
    setSaving2(true);
    setMsg2('');
    try {
      await setDoc(doc(db, 'predicciones_fase2', user.id), {
        ...bracket,
        userId: user.id,
        updatedAt: serverTimestamp(),
      });
      setMsg2('¡Guardado correctamente!');
      setTimeout(() => setMsg2(''), 3000);
    } catch {
      setMsg2('Error al guardar. Inténtalo de nuevo.');
    } finally {
      setSaving2(false);
    }
  };

  // ── Cambiar resultado de partido grupo ────────────────────────────────────────
  const updatePartido = useCallback((id, value) => {
    setFase1((prev) => ({
      ...prev,
      partidos: { ...prev.partidos, [id]: value },
    }));
  }, []);

  // ── Cambiar resultado de partido bracket ──────────────────────────────────────
  const updateBracketMatch = useCallback((ronda, idx, value) => {
    setBracket((prev) => {
      let next;
      if (Array.isArray(prev[ronda])) {
        const arr = [...prev[ronda]];
        arr[idx] = { ...arr[idx], ...value };
        next = { ...prev, [ronda]: arr };
      } else {
        next = { ...prev, [ronda]: { ...prev[ronda], ...value } };
      }
      // Propagar ganadores hacia rondas siguientes
      if (['d32', 'o16', 'qf', 'sf'].includes(ronda)) {
        next = propagateBracket(next);
      }
      return next;
    });
  }, []);

  if (loadingData) {
    return <div className="spinner-wrap"><div className="spinner" /></div>;
  }

  const fase1Cerrada = torneoConfig?.fase1Cerrada;
  const fase2Habilitada = torneoConfig?.fase2Habilitada;

  const RONDAS_BRACKET = [
    { key: 'd32', label: 'Dieciseisavos de Final', count: 16 },
    { key: 'o16', label: 'Octavos de Final', count: 8 },
    { key: 'qf', label: 'Cuartos de Final', count: 4 },
    { key: 'sf', label: 'Semifinales', count: 2 },
  ];

  const btnSave = {
    display: 'inline-flex', alignItems: 'center', gap: '0.4rem',
    padding: '0.625rem 1.25rem', borderRadius: '10px',
    background: '#f4a87c', color: '#fff', border: 'none',
    fontSize: '0.875rem', fontWeight: 600, cursor: 'pointer',
    transition: '0.2s ease', fontFamily: 'inherit',
    boxShadow: '0 2px 10px rgba(244, 168, 124, 0.3)',
  };

  const sectionTitle = {
    fontFamily: "'Playfair Display', Georgia, serif",
    fontWeight: 700, fontSize: '1.0625rem', color: '#2d3142',
    display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: 0,
  };

  return (
    <div className="page" style={{ background: 'linear-gradient(150deg, #faf9f7 0%, #f5ede6 45%, #edf0f5 100%)' }}>
      <div className="container">
        {/* ── Cabecera del perfil ─────────────────────────────────────────── */}
        <div className="page-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', marginBottom: '2rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <User size={22} color="#ef8354" strokeWidth={1.5} />
            <h1 style={{
              fontFamily: "'Cormorant Garamond', Georgia, serif",
              fontSize: '1.875rem', fontWeight: 600, fontStyle: 'italic',
              color: '#2d3142', display: 'flex', alignItems: 'baseline',
              gap: '0.45rem', flexWrap: 'wrap',
            }}>
              {user.nombre} {user.apellidos}
              <span style={{ color: '#ccc5b9', fontStyle: 'normal', fontWeight: 300 }}>—</span>
              <span style={{ color: '#ef8354' }}>@{user.nickname}</span>
            </h1>
          </div>
          <span style={{
            fontFamily: "'Inter', system-ui, sans-serif",
            fontSize: '0.875rem', fontWeight: 600, letterSpacing: '0.02em',
            color: user.pagado ? '#059669' : '#dc2626',
            padding: '0.3rem 0.75rem',
            background: user.pagado ? 'rgba(5,150,105,0.08)' : 'rgba(220,38,38,0.08)',
            borderRadius: '6px',
            border: `1px solid ${user.pagado ? 'rgba(5,150,105,0.2)' : 'rgba(220,38,38,0.2)'}`,
          }}>
            {user.pagado ? 'Cuota pagada' : 'Cuota pendiente'}
          </span>
        </div>

        {/* ══════════════════════════════════════════════════════════════════ */}
        {/* FASE 1: Fase de Grupos                                            */}
        {/* ══════════════════════════════════════════════════════════════════ */}
        <div className="card" style={{ marginBottom: '2rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.75rem' }}>
            <div style={sectionTitle}>
              Fase de Grupos
              <span style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontStyle: 'italic', color: '#ef8354', fontWeight: 600 }}>
                — Plantilla de Predicciones
              </span>
              {fase1Cerrada && (
                <span className="badge badge-red" style={{ marginLeft: '0.25rem' }}>
                  <Lock size={11} /> Cerrada
                </span>
              )}
            </div>
            {!fase1Cerrada && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                {msg1 && (
                  <span style={{ fontSize: '0.8125rem', color: msg1.includes('Error') ? '#dc2626' : '#059669' }}>
                    {msg1}
                  </span>
                )}
                <button style={btnSave} onClick={saveFase1} disabled={saving1}>
                  {saving1 ? 'Guardando…' : 'Guardar respuestas'}
                </button>
              </div>
            )}
          </div>

          {fase1Cerrada && (
            <div className="alert alert-warning" style={{ marginBottom: '1.25rem' }}>
              <Lock size={16} />
              La plantilla de fase de grupos está cerrada. Ya no se pueden modificar las predicciones.
            </div>
          )}

          {/* Tabs de grupos */}
          <div className="tabs" style={{ marginBottom: '1.25rem' }}>
            {Object.keys(GRUPOS).map((letra) => {
              const isActive = activeGroup === letra;
              return (
                <button
                  key={letra}
                  className="tab"
                  style={{
                    fontFamily: "'Inter', system-ui, sans-serif",
                    fontSize: '0.6875rem', letterSpacing: '0.04em',
                    textTransform: 'uppercase',
                    padding: '0.375rem 0.75rem',
                    fontWeight: isActive ? 700 : 500,
                    ...(isActive ? {
                      color: '#5b8db8',
                      background: 'rgba(91, 141, 184, 0.07)',
                      borderColor: 'rgba(91, 141, 184, 0.22)',
                      boxShadow: '0 2px 8px rgba(91, 141, 184, 0.1)',
                    } : {}),
                  }}
                  onClick={() => setActiveGroup(letra)}
                >
                  Grupo {letra}
                </button>
              );
            })}
          </div>

          {/* Partidos del grupo activo */}
          <div className="group-card" style={{ maxWidth: 680, margin: '0 auto' }}>
            <div className="group-card-header" style={{
              fontFamily: MONO,
              textTransform: 'none', letterSpacing: '0.01em',
              fontWeight: 500, fontSize: '0.8125rem',
              display: 'flex', flexWrap: 'wrap', gap: '0 0.375rem',
              justifyContent: 'center', textAlign: 'center',
            }}>
              {GRUPOS[activeGroup].equipos.map((eq, i) => (
                <span key={eq}>
                  {i > 0 && <span style={{ color: '#ccc5b9' }}>,&nbsp;</span>}
                  <span style={{ fontFamily: MONO, color: '#ef8354', fontWeight: 700, fontSize: '0.625rem' }}>{getAcronimo(eq)}</span>
                  {' '}
                  <span style={{ color: '#7ab5cc' }}>{eq}</span>
                </span>
              ))}
            </div>
            <div className="group-card-body" style={{ paddingBottom: '0.75rem' }}>
              {PARTIDOS_POR_GRUPO[activeGroup].map((partido, idx) => {
                const jornada = partido.jornada;
                const isFirstOfJornada = idx === 0 || PARTIDOS_POR_GRUPO[activeGroup][idx - 1].jornada !== jornada;
                return (
                  <div key={partido.id}>
                    {isFirstOfJornada && (
                      <p style={{ fontSize: '0.6875rem', fontWeight: 700, color: '#ccc5b9', textTransform: 'uppercase', letterSpacing: '0.08em', padding: '0.5rem 0 0.125rem', textAlign: 'center' }}>
                        Jornada {jornada}
                      </p>
                    )}
                    <MatchInput
                      partido={partido}
                      value={fase1.partidos?.[partido.id]}
                      onChange={(val) => updatePartido(partido.id, val)}
                      locked={fase1Cerrada}
                    />
                  </div>
                );
              })}
            </div>
          </div>

          {/* Premios individuales */}
          <div style={{ marginTop: '1.75rem' }}>
            <div style={{ ...sectionTitle, marginBottom: '1rem' }}>
              <Star size={16} color="#ef8354" />
              Premios individuales
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
              <div className="form-group-light" style={{ marginBottom: 0 }}>
                <label className="form-label-light" style={{ textAlign: 'center', display: 'block' }}>Máximo goleador</label>
                <input
                  className="form-input-light"
                  type="text"
                  placeholder="Nombre del jugador"
                  value={fase1.maxGoleador || ''}
                  onChange={(e) => setFase1((p) => ({ ...p, maxGoleador: e.target.value }))}
                  disabled={fase1Cerrada}
                />
              </div>
              <div className="form-group-light" style={{ marginBottom: 0 }}>
                <label className="form-label-light" style={{ textAlign: 'center', display: 'block' }}>🥇 Balón de Oro</label>
                <input
                  className="form-input-light"
                  type="text"
                  placeholder="Nombre del jugador"
                  value={fase1.balonOro || ''}
                  onChange={(e) => setFase1((p) => ({ ...p, balonOro: e.target.value }))}
                  disabled={fase1Cerrada}
                />
              </div>
              <div className="form-group-light" style={{ marginBottom: 0 }}>
                <label className="form-label-light" style={{ textAlign: 'center', display: 'block' }}>🥈 Balón de Plata</label>
                <input
                  className="form-input-light"
                  type="text"
                  placeholder="Nombre del jugador"
                  value={fase1.balonPlata || ''}
                  onChange={(e) => setFase1((p) => ({ ...p, balonPlata: e.target.value }))}
                  disabled={fase1Cerrada}
                />
              </div>
              <div className="form-group-light" style={{ marginBottom: 0 }}>
                <label className="form-label-light" style={{ textAlign: 'center', display: 'block' }}>🥉 Balón de Bronce</label>
                <input
                  className="form-input-light"
                  type="text"
                  placeholder="Nombre del jugador"
                  value={fase1.balonBronce || ''}
                  onChange={(e) => setFase1((p) => ({ ...p, balonBronce: e.target.value }))}
                  disabled={fase1Cerrada}
                />
              </div>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
