import { useState, useEffect } from 'react';
import {
  doc,
  getDoc,
  setDoc,
  getDocs,
  collection,
  updateDoc,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from '../firebase/config';
import { GRUPOS, PARTIDOS_POR_GRUPO, TODOS_LOS_EQUIPOS, getBandera } from '../data/worldcup2026';
import {
  Shield,
  Grid3X3,
  GitMerge,
  Star,
  Euro,
  Settings,
  Save,
  CheckCircle,
  Users,
} from 'lucide-react';

// ────────────────────────────────────────────────────────────────────────────────
// Panel: Estado del Torneo
// ────────────────────────────────────────────────────────────────────────────────
function PanelEstado({ config, onSave }) {
  const [state, setState] = useState({
    fase1Cerrada: config?.fase1Cerrada || false,
    fase2Habilitada: config?.fase2Habilitada || false,
    boteTotal: config?.boteTotal || '',
    maxGoleadorActual: config?.maxGoleadorActual || '',
  });
  const [saving, setSaving] = useState(false);
  const [ok, setOk] = useState('');

  const save = async () => {
    setSaving(true);
    try {
      await setDoc(doc(db, 'torneo', 'config'), { ...config, ...state, updatedAt: serverTimestamp() }, { merge: true });
      setOk('Guardado');
      onSave({ ...config, ...state });
      setTimeout(() => setOk(''), 2000);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="card">
      <div className="card-title"><Settings size={16} color="var(--gold)" /> Estado del Torneo</div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        <Toggle
          label="Fase 1 cerrada"
          hint="Los usuarios no podrán modificar sus predicciones de la fase de grupos"
          value={state.fase1Cerrada}
          onChange={(v) => setState((p) => ({ ...p, fase1Cerrada: v }))}
        />
        <Toggle
          label="Habilitar Fase 2 (Eliminatoria)"
          hint="Permite a los usuarios rellenar la plantilla de la fase eliminatoria"
          value={state.fase2Habilitada}
          onChange={(v) => setState((p) => ({ ...p, fase2Habilitada: v }))}
        />

        <hr style={{ border: 'none', borderTop: '1px solid var(--border)' }} />

        <div className="form-group" style={{ marginBottom: 0 }}>
          <label className="form-label">⚽ Máximo goleador actual (durante el torneo)</label>
          <input
            className="form-input"
            type="text"
            placeholder="Nombre del jugador"
            value={state.maxGoleadorActual}
            onChange={(e) => setState((p) => ({ ...p, maxGoleadorActual: e.target.value }))}
          />
          <p className="form-hint">Se muestra en la clasificación como información en directo.</p>
        </div>

        <div className="form-group" style={{ marginBottom: 0 }}>
          <label className="form-label">💰 Bote total (€)</label>
          <input
            className="form-input"
            type="number"
            min="0"
            placeholder="Ej: 200"
            value={state.boteTotal}
            onChange={(e) => setState((p) => ({ ...p, boteTotal: e.target.value }))}
          />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <button className="btn btn-primary" onClick={save} disabled={saving}>
            <Save size={15} /> {saving ? 'Guardando…' : 'Guardar estado'}
          </button>
          {ok && <span style={{ color: 'var(--green)', fontSize: '0.875rem' }}>✓ {ok}</span>}
        </div>
      </div>
    </div>
  );
}

// ────────────────────────────────────────────────────────────────────────────────
// Panel: Resultados Fase de Grupos
// ────────────────────────────────────────────────────────────────────────────────
function PanelResultadosGrupos() {
  const [activeGroup, setActiveGroup] = useState('A');
  const [resultados, setResultados] = useState({ partidos: {} });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [ok, setOk] = useState('');

  useEffect(() => {
    getDoc(doc(db, 'resultados', 'grupos')).then((snap) => {
      if (snap.exists()) setResultados(snap.data());
      setLoading(false);
    });
  }, []);

  const updateResult = (id, field, value) => {
    const num = value === '' ? '' : Math.max(0, parseInt(value, 10) || 0);
    setResultados((prev) => ({
      ...prev,
      partidos: {
        ...prev.partidos,
        [id]: { ...(prev.partidos?.[id] || {}), [field]: num },
      },
    }));
  };

  const save = async () => {
    setSaving(true);
    try {
      await setDoc(doc(db, 'resultados', 'grupos'), { ...resultados, updatedAt: serverTimestamp() }, { merge: true });
      setOk('Guardado');
      setTimeout(() => setOk(''), 2000);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="card">
      <div className="card-title"><Grid3X3 size={16} color="var(--gold)" /> Resultados Fase de Grupos</div>

      <div className="tabs" style={{ marginBottom: '1.25rem' }}>
        {Object.keys(GRUPOS).map((letra) => (
          <button key={letra} className={`tab ${activeGroup === letra ? 'active' : ''}`} onClick={() => setActiveGroup(letra)}>
            Grupo {letra}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="spinner-wrap"><div className="spinner" /></div>
      ) : (
        <div className="group-card">
          <div className="group-card-header">
            {GRUPOS[activeGroup].nombre} &mdash; {GRUPOS[activeGroup].equipos.join(' · ')}
          </div>
          <div className="group-card-body">
            {PARTIDOS_POR_GRUPO[activeGroup].map((p, idx) => {
              const jornada = p.jornada;
              const isFirst = idx === 0 || PARTIDOS_POR_GRUPO[activeGroup][idx - 1].jornada !== jornada;
              const res = resultados.partidos?.[p.id] || {};
              return (
                <div key={p.id}>
                  {isFirst && (
                    <p style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.08em', padding: '0.75rem 0 0.25rem' }}>
                      Jornada {jornada}
                    </p>
                  )}
                  <div className="match-row">
                    <div className="match-team">
                      <span className="match-flag">{getBandera(p.local)}</span>
                      <span className="match-team-name">{p.local}</span>
                    </div>
                    <div className="match-score-center">
                      <input className="score-input" type="number" min="0" max="99" value={res.g1 ?? ''} onChange={(e) => updateResult(p.id, 'g1', e.target.value)} placeholder="—" />
                      <span className="score-separator">:</span>
                      <input className="score-input" type="number" min="0" max="99" value={res.g2 ?? ''} onChange={(e) => updateResult(p.id, 'g2', e.target.value)} placeholder="—" />
                    </div>
                    <div className="match-team right">
                      <span className="match-flag">{getBandera(p.visitante)}</span>
                      <span className="match-team-name">{p.visitante}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginTop: '1.25rem' }}>
        <button className="btn btn-primary" onClick={save} disabled={saving}>
          <Save size={15} /> {saving ? 'Guardando…' : 'Guardar resultados'}
        </button>
        {ok && <span style={{ color: 'var(--green)', fontSize: '0.875rem' }}>✓ {ok}</span>}
      </div>
    </div>
  );
}

// ────────────────────────────────────────────────────────────────────────────────
// Panel: Configurar Eliminatoria (D32 matchups + resultados)
// ────────────────────────────────────────────────────────────────────────────────
function PanelEliminatoria({ config, onConfigSave }) {
  const emptyMatchup = () => ({ team1: '', team2: '' });
  const [d32, setD32] = useState(
    config?.d32Matchups?.length === 16
      ? config.d32Matchups
      : Array(16).fill(null).map(emptyMatchup)
  );
  const [resultados, setResultados] = useState({ d32: [], o16: [], qf: [], sf: [], tercerPuesto: {}, final: {} });
  const [loadingRes, setLoadingRes] = useState(true);
  const [savingSetup, setSavingSetup] = useState(false);
  const [savingRes, setSavingRes] = useState(false);
  const [okSetup, setOkSetup] = useState('');
  const [okRes, setOkRes] = useState('');
  const [activeTab, setActiveTab] = useState('setup');

  useEffect(() => {
    getDoc(doc(db, 'resultados', 'eliminatoria')).then((snap) => {
      if (snap.exists()) {
        const data = snap.data();
        setResultados({
          d32: data.d32 || Array(16).fill(null).map(() => ({ g1: '', g2: '' })),
          o16: data.o16 || Array(8).fill(null).map(() => ({ team1: '', team2: '', g1: '', g2: '' })),
          qf: data.qf || Array(4).fill(null).map(() => ({ team1: '', team2: '', g1: '', g2: '' })),
          sf: data.sf || Array(2).fill(null).map(() => ({ team1: '', team2: '', g1: '', g2: '' })),
          tercerPuesto: data.tercerPuesto || { team1: '', team2: '', g1: '', g2: '' },
          final: data.final || { team1: '', team2: '', g1: '', g2: '' },
        });
      }
      setLoadingRes(false);
    });
  }, []);

  const saveSetup = async () => {
    setSavingSetup(true);
    try {
      await setDoc(doc(db, 'torneo', 'config'), { ...config, d32Matchups: d32, updatedAt: serverTimestamp() }, { merge: true });
      onConfigSave({ ...config, d32Matchups: d32 });
      setOkSetup('Guardado');
      setTimeout(() => setOkSetup(''), 2000);
    } finally {
      setSavingSetup(false);
    }
  };

  const saveResultados = async () => {
    setSavingRes(true);
    try {
      await setDoc(doc(db, 'resultados', 'eliminatoria'), { ...resultados, updatedAt: serverTimestamp() }, { merge: true });
      setOkRes('Guardado');
      setTimeout(() => setOkRes(''), 2000);
    } finally {
      setSavingRes(false);
    }
  };

  const updateD32Team = (idx, field, value) => {
    setD32((prev) => {
      const next = [...prev];
      next[idx] = { ...next[idx], [field]: value };
      return next;
    });
  };

  const updateRes = (ronda, idx, field, value) => {
    const isScore = field === 'g1' || field === 'g2';
    const processed = isScore
      ? (value === '' ? '' : Math.max(0, parseInt(value, 10) || 0))
      : value;
    setResultados((prev) => {
      if (Array.isArray(prev[ronda])) {
        const arr = [...(prev[ronda] || [])];
        if (!arr[idx]) arr[idx] = {};
        arr[idx] = { ...arr[idx], [field]: processed };
        return { ...prev, [ronda]: arr };
      } else {
        return { ...prev, [ronda]: { ...prev[ronda], [field]: processed } };
      }
    });
  };

  const RONDAS_RES = [
    { key: 'd32', label: 'Dieciseisavos', count: 16 },
    { key: 'o16', label: 'Octavos', count: 8 },
    { key: 'qf', label: 'Cuartos', count: 4 },
    { key: 'sf', label: 'Semis', count: 2 },
  ];

  return (
    <div className="card">
      <div className="card-title"><GitMerge size={16} color="var(--gold)" /> Fase Eliminatoria</div>

      <div className="tabs" style={{ marginBottom: '1.5rem' }}>
        <button className={`tab ${activeTab === 'setup' ? 'active' : ''}`} onClick={() => setActiveTab('setup')}>
          Configurar enfrentamientos
        </button>
        <button className={`tab ${activeTab === 'resultados' ? 'active' : ''}`} onClick={() => setActiveTab('resultados')}>
          Resultados
        </button>
      </div>

      {activeTab === 'setup' && (
        <>
          <div className="alert alert-info" style={{ marginBottom: '1.25rem' }}>
            Configura los 16 enfrentamientos de dieciseisavos. Usa los equipos que han clasificado de la fase de grupos.
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
            {d32.map((m, idx) => (
              <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.625rem 0.875rem', background: 'var(--bg-2)', borderRadius: 'var(--r-md)', border: '1px solid var(--border-2)' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-3)', fontWeight: 700, width: '1.5rem' }}>
                  {idx + 1}
                </span>
                <select
                  className="form-input form-select"
                  style={{ flex: 1 }}
                  value={m.team1}
                  onChange={(e) => updateD32Team(idx, 'team1', e.target.value)}
                >
                  <option value="">— Equipo 1 —</option>
                  {TODOS_LOS_EQUIPOS.map((eq) => (
                    <option key={eq} value={eq}>{getBandera(eq)} {eq}</option>
                  ))}
                </select>
                <span style={{ color: 'var(--text-3)', fontWeight: 700 }}>vs</span>
                <select
                  className="form-input form-select"
                  style={{ flex: 1 }}
                  value={m.team2}
                  onChange={(e) => updateD32Team(idx, 'team2', e.target.value)}
                >
                  <option value="">— Equipo 2 —</option>
                  {TODOS_LOS_EQUIPOS.map((eq) => (
                    <option key={eq} value={eq}>{getBandera(eq)} {eq}</option>
                  ))}
                </select>
              </div>
            ))}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginTop: '1.25rem' }}>
            <button className="btn btn-primary" onClick={saveSetup} disabled={savingSetup}>
              <Save size={15} /> {savingSetup ? 'Guardando…' : 'Guardar enfrentamientos'}
            </button>
            {okSetup && <span style={{ color: 'var(--green)', fontSize: '0.875rem' }}>✓ {okSetup}</span>}
          </div>
        </>
      )}

      {activeTab === 'resultados' && !loadingRes && (
        <>
          {RONDAS_RES.map(({ key, label, count }) => (
            <div key={key} style={{ marginBottom: '1.5rem' }}>
              <p style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--gold)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.75rem' }}>
                {label}
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {Array.from({ length: count }).map((_, idx) => {
                  const match = (resultados[key] || [])[idx] || {};
                  const d32m = (config?.d32Matchups || [])[idx] || {};
                  const team1 = key === 'd32' ? d32m.team1 : match.team1;
                  const team2 = key === 'd32' ? d32m.team2 : match.team2;
                  return (
                    <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.5rem 0.875rem', background: 'var(--bg-2)', borderRadius: 'var(--r-md)', border: '1px solid var(--border-2)' }}>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-3)', fontWeight: 700, width: '1.25rem' }}>
                        {idx + 1}
                      </span>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', flex: 1, minWidth: 0 }}>
                        <span>{getBandera(team1)}</span>
                        <span style={{ fontSize: '0.875rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{team1 || '?'}</span>
                      </div>
                      <input className="score-input" type="number" min="0" value={match.g1 ?? ''} onChange={(e) => updateRes(key, idx, 'g1', e.target.value)} placeholder="—" />
                      <span className="score-separator">:</span>
                      <input className="score-input" type="number" min="0" value={match.g2 ?? ''} onChange={(e) => updateRes(key, idx, 'g2', e.target.value)} placeholder="—" />
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', flex: 1, minWidth: 0, justifyContent: 'flex-end' }}>
                        <span style={{ fontSize: '0.875rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{team2 || '?'}</span>
                        <span>{getBandera(team2)}</span>
                      </div>
                      {key !== 'd32' && (
                        <div style={{ display: 'flex', gap: '0.5rem', minWidth: 200 }}>
                          <select className="form-input form-select" style={{ flex: 1, padding: '0.375rem 0.625rem', fontSize: '0.8125rem' }} value={match.team1 || ''} onChange={(e) => updateRes(key, idx, 'team1', e.target.value)}>
                            <option value="">— Equipo 1 —</option>
                            {TODOS_LOS_EQUIPOS.map((eq) => <option key={eq} value={eq}>{eq}</option>)}
                          </select>
                          <select className="form-input form-select" style={{ flex: 1, padding: '0.375rem 0.625rem', fontSize: '0.8125rem' }} value={match.team2 || ''} onChange={(e) => updateRes(key, idx, 'team2', e.target.value)}>
                            <option value="">— Equipo 2 —</option>
                            {TODOS_LOS_EQUIPOS.map((eq) => <option key={eq} value={eq}>{eq}</option>)}
                          </select>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}

          {/* Tercer puesto */}
          <p style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--gold)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.5rem' }}>🥉 Tercer puesto</p>
          <MatchupResRow match={resultados.tercerPuesto || {}} onChange={(f, v) => setResultados((p) => ({ ...p, tercerPuesto: { ...p.tercerPuesto, [f]: v } }))} />

          <p style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--gold)', textTransform: 'uppercase', letterSpacing: '0.08em', margin: '1rem 0 0.5rem' }}>🏆 Final</p>
          <MatchupResRow match={resultados.final || {}} onChange={(f, v) => setResultados((p) => ({ ...p, final: { ...p.final, [f]: v } }))} />

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginTop: '1.25rem' }}>
            <button className="btn btn-primary" onClick={saveResultados} disabled={savingRes}>
              <Save size={15} /> {savingRes ? 'Guardando…' : 'Guardar resultados'}
            </button>
            {okRes && <span style={{ color: 'var(--green)', fontSize: '0.875rem' }}>✓ {okRes}</span>}
          </div>
        </>
      )}
    </div>
  );
}

function MatchupResRow({ match, onChange }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.5rem 0.875rem', background: 'var(--bg-2)', borderRadius: 'var(--r-md)', border: '1px solid var(--border-2)', marginBottom: '0.5rem' }}>
      <select className="form-input form-select" style={{ flex: 1, fontSize: '0.875rem' }} value={match.team1 || ''} onChange={(e) => onChange('team1', e.target.value)}>
        <option value="">— Equipo 1 —</option>
        {TODOS_LOS_EQUIPOS.map((eq) => <option key={eq} value={eq}>{getBandera(eq)} {eq}</option>)}
      </select>
      <input className="score-input" type="number" min="0" value={match.g1 ?? ''} onChange={(e) => onChange('g1', e.target.value === '' ? '' : Math.max(0, parseInt(e.target.value, 10) || 0))} placeholder="—" />
      <span className="score-separator">:</span>
      <input className="score-input" type="number" min="0" value={match.g2 ?? ''} onChange={(e) => onChange('g2', e.target.value === '' ? '' : Math.max(0, parseInt(e.target.value, 10) || 0))} placeholder="—" />
      <select className="form-input form-select" style={{ flex: 1, fontSize: '0.875rem' }} value={match.team2 || ''} onChange={(e) => onChange('team2', e.target.value)}>
        <option value="">— Equipo 2 —</option>
        {TODOS_LOS_EQUIPOS.map((eq) => <option key={eq} value={eq}>{getBandera(eq)} {eq}</option>)}
      </select>
    </div>
  );
}

// ────────────────────────────────────────────────────────────────────────────────
// Panel: Premios Individuales
// ────────────────────────────────────────────────────────────────────────────────
function PanelPremios({ config, onSave }) {
  const [state, setState] = useState({
    maxGoleador: config?.maxGoleador || '',
    balonOro: config?.balonOro || '',
    balonPlata: config?.balonPlata || '',
    balonBronce: config?.balonBronce || '',
  });
  const [saving, setSaving] = useState(false);
  const [ok, setOk] = useState('');

  const save = async () => {
    setSaving(true);
    try {
      // Guardar en resultados/grupos para que el scoring los lea
      await setDoc(doc(db, 'resultados', 'grupos'), state, { merge: true });
      setOk('Guardado');
      setTimeout(() => setOk(''), 2000);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="card">
      <div className="card-title"><Star size={16} color="var(--gold)" /> Premios individuales del torneo</div>
      <p style={{ color: 'var(--text-2)', fontSize: '0.875rem', marginBottom: '1.25rem' }}>
        Actualiza estos valores al final del torneo para calcular los puntos de los premios individuales.
      </p>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
        {[
          { key: 'maxGoleador', label: '⚽ Máximo goleador (+4 pts)' },
          { key: 'balonOro', label: '🥇 Balón de Oro (+3 pts)' },
          { key: 'balonPlata', label: '🥈 Balón de Plata (+2 pts)' },
          { key: 'balonBronce', label: '🥉 Balón de Bronce (+1 pt)' },
        ].map(({ key, label }) => (
          <div className="form-group" key={key} style={{ marginBottom: 0 }}>
            <label className="form-label">{label}</label>
            <input
              className="form-input"
              type="text"
              placeholder="Nombre del jugador"
              value={state[key]}
              onChange={(e) => setState((p) => ({ ...p, [key]: e.target.value }))}
            />
          </div>
        ))}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginTop: '1.25rem' }}>
        <button className="btn btn-primary" onClick={save} disabled={saving}>
          <Save size={15} /> {saving ? 'Guardando…' : 'Guardar premios'}
        </button>
        {ok && <span style={{ color: 'var(--green)', fontSize: '0.875rem' }}>✓ {ok}</span>}
      </div>
    </div>
  );
}

// ────────────────────────────────────────────────────────────────────────────────
// Panel: Gestión de Pagos
// ────────────────────────────────────────────────────────────────────────────────
function PanelPagos() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState('');

  useEffect(() => {
    getDocs(collection(db, 'users')).then((snap) => {
      setUsers(
        snap.docs
          .map((d) => ({ id: d.id, ...d.data() }))
          .filter((u) => !u.isAdmin)
          .sort((a, b) => a.nickname.localeCompare(b.nickname))
      );
      setLoading(false);
    });
  }, []);

  const togglePago = async (userId, current) => {
    setSaving(userId);
    try {
      await updateDoc(doc(db, 'users', userId), { pagado: !current });
      setUsers((prev) => prev.map((u) => u.id === userId ? { ...u, pagado: !current } : u));
    } finally {
      setSaving('');
    }
  };

  const totalPagados = users.filter((u) => u.pagado).length;

  return (
    <div className="card">
      <div className="card-title"><Euro size={16} color="var(--gold)" /> Gestión de pagos</div>

      <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
        <div className="stat-card" style={{ flex: 'none' }}>
          <div className="stat-label">Participantes</div>
          <div className="stat-value">{users.length}</div>
        </div>
        <div className="stat-card" style={{ flex: 'none' }}>
          <div className="stat-label">Han pagado</div>
          <div className="stat-value" style={{ color: 'var(--green)' }}>{totalPagados}</div>
        </div>
        <div className="stat-card" style={{ flex: 'none' }}>
          <div className="stat-label">Pendientes</div>
          <div className="stat-value" style={{ color: 'var(--red)' }}>{users.length - totalPagados}</div>
        </div>
      </div>

      {loading ? (
        <div className="spinner-wrap"><div className="spinner" /></div>
      ) : (
        <div className="table-wrapper">
          <table className="table">
            <thead>
              <tr>
                <th>Participante</th>
                <th>Nickname</th>
                <th>Email</th>
                <th style={{ textAlign: 'center' }}>Estado</th>
                <th style={{ textAlign: 'center' }}>Acción</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id}>
                  <td>
                    <div style={{ fontWeight: 600 }}>{u.nombre} {u.apellidos}</div>
                  </td>
                  <td style={{ color: 'var(--gold)', fontWeight: 600 }}>@{u.nickname}</td>
                  <td style={{ color: 'var(--text-2)', fontSize: '0.875rem' }}>{u.email}</td>
                  <td style={{ textAlign: 'center' }}>
                    <span className={`badge ${u.pagado ? 'badge-green' : 'badge-red'}`}>
                      {u.pagado ? '✓ Pagado' : '⚠ Pendiente'}
                    </span>
                  </td>
                  <td style={{ textAlign: 'center' }}>
                    <button
                      className={`btn btn-sm ${u.pagado ? 'btn-danger' : 'btn-secondary'}`}
                      onClick={() => togglePago(u.id, u.pagado)}
                      disabled={saving === u.id}
                    >
                      {saving === u.id ? '…' : u.pagado ? 'Marcar pendiente' : 'Marcar pagado'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// ────────────────────────────────────────────────────────────────────────────────
// Panel: Ver todos los usuarios
// ────────────────────────────────────────────────────────────────────────────────
function PanelUsuarios() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getDocs(collection(db, 'users')).then((snap) => {
      setUsers(snap.docs.map((d) => ({ id: d.id, ...d.data() })).sort((a, b) => a.nickname.localeCompare(b.nickname)));
      setLoading(false);
    });
  }, []);

  return (
    <div className="card">
      <div className="card-title"><Users size={16} color="var(--gold)" /> Usuarios registrados</div>
      {loading ? (
        <div className="spinner-wrap"><div className="spinner" /></div>
      ) : (
        <div className="table-wrapper">
          <table className="table">
            <thead>
              <tr>
                <th>Nickname</th>
                <th>Nombre completo</th>
                <th>Email</th>
                <th>Contraseña</th>
                <th style={{ textAlign: 'center' }}>Admin</th>
                <th style={{ textAlign: 'center' }}>Pago</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id}>
                  <td style={{ color: 'var(--gold)', fontWeight: 700 }}>@{u.nickname}</td>
                  <td>{u.nombre} {u.apellidos}</td>
                  <td style={{ color: 'var(--text-2)', fontSize: '0.875rem' }}>{u.email}</td>
                  <td style={{ color: 'var(--text-3)', fontSize: '0.875rem', fontFamily: 'monospace' }}>{u.password}</td>
                  <td style={{ textAlign: 'center' }}>
                    {u.isAdmin && <span className="badge badge-gold">Admin</span>}
                  </td>
                  <td style={{ textAlign: 'center' }}>
                    <span className={`badge ${u.pagado ? 'badge-green' : 'badge-red'}`}>
                      {u.pagado ? '✓' : '⚠'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// ────────────────────────────────────────────────────────────────────────────────
// Toggle helper
// ────────────────────────────────────────────────────────────────────────────────
function Toggle({ label, hint, value, onChange }) {
  return (
    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '1rem' }}>
      <div>
        <p style={{ fontWeight: 600, fontSize: '0.9375rem' }}>{label}</p>
        {hint && <p style={{ color: 'var(--text-3)', fontSize: '0.8125rem', marginTop: '0.2rem' }}>{hint}</p>}
      </div>
      <button
        onClick={() => onChange(!value)}
        style={{
          width: 44,
          height: 24,
          borderRadius: 12,
          background: value ? 'var(--gold)' : 'var(--border)',
          border: 'none',
          cursor: 'pointer',
          position: 'relative',
          transition: 'background 0.2s',
          flexShrink: 0,
        }}
      >
        <span style={{
          position: 'absolute',
          top: 2,
          left: value ? 22 : 2,
          width: 20,
          height: 20,
          borderRadius: '50%',
          background: '#fff',
          transition: 'left 0.2s',
          boxShadow: '0 1px 4px rgba(0,0,0,0.3)',
        }} />
      </button>
    </div>
  );
}

// ────────────────────────────────────────────────────────────────────────────────
// Admin principal
// ────────────────────────────────────────────────────────────────────────────────
const MENU = [
  { id: 'estado', label: 'Estado', icon: Settings },
  { id: 'grupos', label: 'Resultados Grupos', icon: Grid3X3 },
  { id: 'eliminatoria', label: 'Eliminatoria', icon: GitMerge },
  { id: 'premios', label: 'Premios', icon: Star },
  { id: 'pagos', label: 'Pagos', icon: Euro },
  { id: 'usuarios', label: 'Usuarios', icon: Users },
];

export default function Admin() {
  const [activePanel, setActivePanel] = useState('estado');
  const [config, setConfig] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getDoc(doc(db, 'torneo', 'config')).then((snap) => {
      setConfig(snap.exists() ? snap.data() : {});
      setLoading(false);
    });
  }, []);

  if (loading) return <div className="spinner-wrap"><div className="spinner" /></div>;

  return (
    <div className="page">
      <div className="container">
        <div className="page-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', marginBottom: '0.375rem' }}>
            <Shield size={20} color="var(--gold)" />
            <h1>Panel de Administración</h1>
          </div>
          <p>Gestión de resultados, configuración del torneo y pagos</p>
        </div>

        <div className="admin-grid">
          {/* Sidebar */}
          <div className="admin-sidebar">
            {MENU.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                className={`admin-nav-item ${activePanel === id ? 'active' : ''}`}
                onClick={() => setActivePanel(id)}
              >
                <Icon size={15} />
                {label}
              </button>
            ))}
          </div>

          {/* Contenido */}
          <div>
            {activePanel === 'estado' && <PanelEstado config={config} onSave={setConfig} />}
            {activePanel === 'grupos' && <PanelResultadosGrupos />}
            {activePanel === 'eliminatoria' && <PanelEliminatoria config={config} onConfigSave={setConfig} />}
            {activePanel === 'premios' && <PanelPremios config={config} />}
            {activePanel === 'pagos' && <PanelPagos />}
            {activePanel === 'usuarios' && <PanelUsuarios />}
          </div>
        </div>
      </div>
    </div>
  );
}
