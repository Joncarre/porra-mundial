import { useState, useEffect, useCallback } from 'react';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase/config';
import { useAuth } from '../context/AuthContext';
import { GRUPOS, PARTIDOS_POR_GRUPO, getBandera } from '../data/worldcup2026';
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
function MatchInput({ partido, value = {}, onChange, locked }) {
  const { local, visitante } = partido;
  const g1 = value.g1 ?? '';
  const g2 = value.g2 ?? '';

  const update = (field, val) => {
    const num = val === '' ? '' : Math.max(0, parseInt(val, 10) || 0);
    onChange({ ...value, [field]: num });
  };

  return (
    <div className="match-row">
      <div className="match-team">
        <span className="match-flag">{getBandera(local)}</span>
        <span className="match-team-name">{local}</span>
      </div>
      <div className="match-score-center">
        <input
          className="score-input"
          type="number"
          min="0"
          max="99"
          value={g1}
          onChange={(e) => update('g1', e.target.value)}
          disabled={locked}
          placeholder="—"
        />
        <span className="score-separator">:</span>
        <input
          className="score-input"
          type="number"
          min="0"
          max="99"
          value={g2}
          onChange={(e) => update('g2', e.target.value)}
          disabled={locked}
          placeholder="—"
        />
      </div>
      <div className="match-team right">
        <span className="match-flag">{getBandera(visitante)}</span>
        <span className="match-team-name">{visitante}</span>
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
          <span className="match-flag">{getBandera(team1)}</span>
          <span className="match-team-name" style={{ fontSize: '0.8125rem' }}>
            {team1 || <span style={{ color: 'var(--text-3)' }}>Por determinar</span>}
          </span>
        </div>
        <div className="match-score-center">
          {isFirst ? (
            <>
              <input
                className="score-input"
                style={{ width: '2.25rem' }}
                type="number"
                min="0"
                value={g1}
                onChange={(e) => update('g1', e.target.value)}
                disabled={locked || !team1 || !team2}
                placeholder="—"
              />
              <span className="score-separator">:</span>
              <input
                className="score-input"
                style={{ width: '2.25rem' }}
                type="number"
                min="0"
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
          <span className="match-flag">{getBandera(team2)}</span>
          <span className="match-team-name" style={{ fontSize: '0.8125rem' }}>
            {team2 || <span style={{ color: 'var(--text-3)' }}>Por determinar</span>}
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

  return (
    <div className="page">
      <div className="container">
        {/* ── Cabecera del perfil ─────────────────────────────────────────── */}
        <div className="page-header" style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', marginBottom: '0.375rem' }}>
              <User size={20} color="var(--gold)" />
              <h1 style={{ fontSize: '1.875rem', fontWeight: 800, letterSpacing: '-0.02em' }}>
                {user.nombre} {user.apellidos}
              </h1>
            </div>
            <p style={{ color: 'var(--text-2)' }}>
              <span style={{ color: 'var(--gold)', fontWeight: 700 }}>@{user.nickname}</span>
              &nbsp;&mdash;&nbsp;{user.email}
            </p>
          </div>
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            {user.pagado ? (
              <span className="badge badge-green">✓ Cuota pagada</span>
            ) : (
              <span className="badge badge-red">⚠ Cuota pendiente</span>
            )}
          </div>
        </div>

        {/* ══════════════════════════════════════════════════════════════════ */}
        {/* FASE 1: Fase de Grupos                                            */}
        {/* ══════════════════════════════════════════════════════════════════ */}
        <div className="card" style={{ marginBottom: '2rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.75rem' }}>
            <div className="card-title" style={{ marginBottom: 0 }}>
              <span className="icon">⚽</span>
              Fase de Grupos — Plantilla de Predicciones
              {fase1Cerrada && (
                <span className="badge badge-red" style={{ marginLeft: '0.5rem' }}>
                  <Lock size={11} /> Cerrada
                </span>
              )}
            </div>
            {!fase1Cerrada && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                {msg1 && (
                  <span style={{ fontSize: '0.8125rem', color: msg1.includes('Error') ? 'var(--red)' : 'var(--green)' }}>
                    {msg1}
                  </span>
                )}
                <button
                  className="btn btn-primary"
                  onClick={saveFase1}
                  disabled={saving1}
                >
                  <Save size={15} />
                  {saving1 ? 'Guardando…' : 'Guardar Fase 1'}
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
            {Object.keys(GRUPOS).map((letra) => (
              <button
                key={letra}
                className={`tab ${activeGroup === letra ? 'active' : ''}`}
                onClick={() => setActiveGroup(letra)}
              >
                Grupo {letra}
              </button>
            ))}
          </div>

          {/* Partidos del grupo activo */}
          <div className="group-card">
            <div className="group-card-header">
              {GRUPOS[activeGroup].nombre} &mdash;&nbsp;
              {GRUPOS[activeGroup].equipos.join(' · ')}
            </div>
            <div className="group-card-body">
              {PARTIDOS_POR_GRUPO[activeGroup].map((partido, idx) => {
                const jornada = partido.jornada;
                const isFirstOfJornada = idx === 0 || PARTIDOS_POR_GRUPO[activeGroup][idx - 1].jornada !== jornada;
                return (
                  <div key={partido.id}>
                    {isFirstOfJornada && (
                      <p style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.08em', padding: '0.75rem 0 0.25rem' }}>
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
            <div className="card-title">
              <Star size={16} color="var(--gold)" />
              Premios individuales
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Máximo goleador (+4 pts)</label>
                <input
                  className="form-input"
                  type="text"
                  placeholder="Nombre del jugador"
                  value={fase1.maxGoleador || ''}
                  onChange={(e) => setFase1((p) => ({ ...p, maxGoleador: e.target.value }))}
                  disabled={fase1Cerrada}
                />
              </div>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Balón de Oro (+3 pts)</label>
                <input
                  className="form-input"
                  type="text"
                  placeholder="Nombre del jugador"
                  value={fase1.balonOro || ''}
                  onChange={(e) => setFase1((p) => ({ ...p, balonOro: e.target.value }))}
                  disabled={fase1Cerrada}
                />
              </div>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Balón de Plata (+2 pts)</label>
                <input
                  className="form-input"
                  type="text"
                  placeholder="Nombre del jugador"
                  value={fase1.balonPlata || ''}
                  onChange={(e) => setFase1((p) => ({ ...p, balonPlata: e.target.value }))}
                  disabled={fase1Cerrada}
                />
              </div>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Balón de Bronce (+1 pt)</label>
                <input
                  className="form-input"
                  type="text"
                  placeholder="Nombre del jugador"
                  value={fase1.balonBronce || ''}
                  onChange={(e) => setFase1((p) => ({ ...p, balonBronce: e.target.value }))}
                  disabled={fase1Cerrada}
                />
              </div>
            </div>
          </div>

          {/* Botón guardar abajo también */}
          {!fase1Cerrada && (
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1.5rem' }}>
              <button className="btn btn-primary" onClick={saveFase1} disabled={saving1}>
                <Save size={15} />
                {saving1 ? 'Guardando…' : 'Guardar Fase 1'}
              </button>
            </div>
          )}
        </div>

        {/* ══════════════════════════════════════════════════════════════════ */}
        {/* FASE 2: Eliminatoria                                              */}
        {/* ══════════════════════════════════════════════════════════════════ */}
        {!fase2Habilitada ? (
          <div className="card">
            <div className="card-title">
              <Trophy size={16} color="var(--gold)" />
              Fase Eliminatoria — Disponible el 28 de junio
            </div>
            <div className="alert alert-info">
              La plantilla de la fase eliminatoria se abrirá el <strong>28 de junio de 2026</strong>, una
              vez que el administrador haya confirmado los 32 equipos que han pasado de la fase de grupos.
            </div>
          </div>
        ) : (
          <div className="card">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '0.75rem' }}>
              <div className="card-title" style={{ marginBottom: 0 }}>
                <Trophy size={16} color="var(--gold)" />
                Fase Eliminatoria — Plantilla de Predicciones
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                {msg2 && (
                  <span style={{ fontSize: '0.8125rem', color: msg2.includes('Error') ? 'var(--red)' : 'var(--green)' }}>
                    {msg2}
                  </span>
                )}
                <button className="btn btn-primary" onClick={saveFase2} disabled={saving2}>
                  <Save size={15} />
                  {saving2 ? 'Guardando…' : 'Guardar Fase 2'}
                </button>
              </div>
            </div>

            <div className="alert alert-info" style={{ marginBottom: '1.5rem' }}>
              Rellena los resultados de cada partido. Los equipos de las rondas posteriores se irán
              calculando automáticamente a partir de tus predicciones anteriores.
            </div>

            {bracket && (
              <>
                {RONDAS_BRACKET.map(({ key, label, count }) => (
                  <div key={key} className="bracket-round">
                    <div className="bracket-round-title">
                      <Trophy size={14} />
                      {label}
                    </div>
                    <div className="bracket-matches-grid">
                      {Array.from({ length: count }).map((_, idx) => {
                        const match = bracket[key]?.[idx] || {};
                        return (
                          <BracketMatchInput
                            key={idx}
                            match={match}
                            onChange={(val) => updateBracketMatch(key, idx, val)}
                            locked={false}
                            isFirst
                          />
                        );
                      })}
                    </div>
                  </div>
                ))}

                {/* Tercer puesto y Final */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div className="bracket-round">
                    <div className="bracket-round-title">🥉 Tercer y Cuarto Puesto</div>
                    <BracketMatchInput
                      match={bracket.tercerPuesto}
                      onChange={(val) => updateBracketMatch('tercerPuesto', 0, val)}
                      locked={false}
                      isFirst
                    />
                  </div>
                  <div className="bracket-round">
                    <div className="bracket-round-title">🏆 Final</div>
                    <BracketMatchInput
                      match={bracket.final}
                      onChange={(val) => updateBracketMatch('final', 0, val)}
                      locked={false}
                      isFirst
                    />
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1.5rem' }}>
                  <button className="btn btn-primary" onClick={saveFase2} disabled={saving2}>
                    <Save size={15} />
                    {saving2 ? 'Guardando…' : 'Guardar Fase 2'}
                  </button>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
