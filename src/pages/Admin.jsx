import { useEffect, useState } from 'react';
import AppHeader from '../components/AppHeader.jsx';
import Avatar from '../components/Avatar.jsx';
import BracketEditor from '../components/BracketEditor.jsx';
import { getAllUsers, updateUser } from '../services/users.js';
import { getAllPrediccionesExtras } from '../services/predicciones.js';
import {
  getResultadosGrupos,
  saveResultadosPartidos,
  getResultadosEliminatoria,
  saveResultadosEliminatoria,
  getResultadosPremios,
  saveResultadosPremios,
} from '../services/resultados.js';
import { getTorneoConfig, saveTorneoConfig } from '../services/torneo.js';
import { GRUPO_LETRAS, partidosDelGrupo } from '../data/grupos.js';
import { clasificacionTodosLosGrupos } from '../utils/bracket.js';
import { useAuth } from '../context/AuthContext.jsx';
import './Admin.css';

const TABS = [
  { id: 'usuarios', label: 'Usuarios' },
  { id: 'extras', label: 'Apuestas extra' },
  { id: 'resultados', label: 'Resultados de grupos' },
  { id: 'eliminatoria', label: 'Eliminatoria' },
  { id: 'premios', label: 'Premios' },
  { id: 'torneo', label: 'Goleador actual' },
];

export default function Admin() {
  const [tab, setTab] = useState('usuarios');

  return (
    <div className="admin-page">
      <AppHeader />
      <main className="admin-main">
        <div className="container">
          <header className="admin-header">
            <span className="eyebrow">Panel del administrador</span>
            <h1 className="admin-title">Gestión de la porra</h1>
            <p className="admin-sub">
              Confirma los pagos de los participantes y actualiza los resultados
              oficiales del torneo. Los cambios se reflejan al instante en las
              pantallas públicas.
            </p>
          </header>

          <nav className="admin-tabs" role="tablist">
            {TABS.map((t) => (
              <button
                key={t.id}
                role="tab"
                aria-selected={tab === t.id}
                className={`admin-tab ${tab === t.id ? 'is-active' : ''}`}
                onClick={() => setTab(t.id)}
              >
                {t.label}
              </button>
            ))}
          </nav>

          {tab === 'usuarios' && <UsersPanel />}
          {tab === 'extras' && <ExtrasPanel />}
          {tab === 'resultados' && <ResultsPanel />}
          {tab === 'eliminatoria' && <EliminatoriaPanel />}
          {tab === 'premios' && <PremiosPanel />}
          {tab === 'torneo' && <TorneoPanel />}
        </div>
      </main>
    </div>
  );
}

/* ============================================================
   Users panel
   ============================================================ */
function UsersPanel() {
  const { user: currentUser, refreshUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);

  useEffect(() => {
    (async () => {
      const all = await getAllUsers();
      setUsers(all);
      setLoading(false);
    })();
  }, []);

  const handleToggle = async (id, field) => {
    setUpdatingId(id);
    try {
      const u = users.find((x) => x.id === id);
      const next = !u[field];
      await updateUser(id, { [field]: next });
      setUsers((list) => list.map((x) => (x.id === id ? { ...x, [field]: next } : x)));
      // Si el admin se quita a sí mismo, refrescar el contexto
      if (id === currentUser?.id) await refreshUser();
    } finally {
      setUpdatingId(null);
    }
  };

  if (loading) return <div className="admin-loading">Cargando usuarios…</div>;

  if (users.length === 0) {
    return (
      <div className="admin-empty">
        Aún no hay usuarios registrados en la porra.
      </div>
    );
  }

  return (
    <div className="admin-panel">
      <div className="admin-panel-head">
        <h2>Participantes</h2>
        <span className="admin-count">{users.length} usuarios</span>
      </div>

      <div className="admin-users-list">
        {users.map((u) => (
          <div key={u.id} className="admin-user">
            <Avatar foto={u.avatarFoto} name={u.nombre || u.nickname} size="md" />
            <div className="admin-user-info">
              <div className="admin-user-name">
                {u.nombre} {u.apellidos}
              </div>
              <div className="admin-user-meta">
                @{u.nickname}
              </div>
            </div>
            <div className="admin-user-toggles">
              <ToggleRow
                label="Pagado"
                checked={u.pagado}
                onClick={() => handleToggle(u.id, 'pagado')}
                disabled={updatingId === u.id}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function ToggleRow({ label, checked, onClick, disabled }) {
  return (
    <label className="admin-toggle">
      <span className="admin-toggle-label">{label}</span>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        className={`admin-switch ${checked ? 'is-on' : ''}`}
        onClick={onClick}
        disabled={disabled}
      >
        <span className="admin-switch-thumb" />
      </button>
    </label>
  );
}

/* ============================================================
   Extras panel — predicciones extra de cada participante
   ============================================================ */
const EXTRAS_COLS = [
  { key: 'maxGoleador', label: 'Máx. goleador' },
  { key: 'balonOro', label: 'Balón de Oro' },
  { key: 'balonPlata', label: 'Balón de Plata' },
  { key: 'balonBronce', label: 'Balón de Bronce' },
];

function ExtrasPanel() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const [users, extras] = await Promise.all([
        getAllUsers(),
        getAllPrediccionesExtras(),
      ]);
      const participantes = users
        .filter((u) => !u.isAdmin)
        .sort((a, b) => (a.nombre || '').localeCompare(b.nombre || '', 'es'))
        .map((u) => ({
          id: u.id,
          nombre: `${u.nombre} ${u.apellidos}`.trim(),
          nickname: u.nickname,
          avatarFoto: u.avatarFoto,
          extras: extras[u.id] || {},
        }));
      setRows(participantes);
      setLoading(false);
    })();
  }, []);

  if (loading) return <div className="admin-loading">Cargando apuestas extra…</div>;

  if (rows.length === 0) {
    return <div className="admin-empty">Aún no hay participantes en la porra.</div>;
  }

  return (
    <div className="admin-panel">
      <div className="admin-panel-head">
        <h2>Apuestas extra por participante</h2>
        <span className="admin-count">{rows.length} participantes</span>
      </div>

      <div className="admin-extras-wrap">
        <table className="admin-extras-table">
          <thead>
            <tr>
              <th className="admin-extras-col-user">Participante</th>
              {EXTRAS_COLS.map((c) => (
                <th key={c.key}>{c.label}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id}>
                <td className="admin-extras-col-user">
                  <div className="admin-extras-user">
                    <Avatar foto={r.avatarFoto} name={r.nombre || r.nickname} size="xs" />
                    <div className="admin-extras-user-text">
                      <span className="admin-extras-name">{r.nombre}</span>
                      <span className="admin-extras-nick">@{r.nickname}</span>
                    </div>
                  </div>
                </td>
                {EXTRAS_COLS.map((c) => {
                  const value = r.extras[c.key]?.trim();
                  return (
                    <td key={c.key} className={value ? '' : 'admin-extras-empty'}>
                      {value || '—'}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ============================================================
   Results panel
   ============================================================ */
function ResultsPanel() {
  const [resultados, setResultados] = useState({});
  const [pending, setPending] = useState({});
  const [loading, setLoading] = useState(true);
  const [savingLetra, setSavingLetra] = useState(null);
  const [savedLetra, setSavedLetra] = useState(null);
  const [grupoActivo, setGrupoActivo] = useState('A');

  useEffect(() => {
    (async () => {
      const data = await getResultadosGrupos();
      setResultados(data.partidos || {});
      setLoading(false);
    })();
  }, []);

  const getInputValue = (partidoId, field) => {
    if (pending[partidoId]?.[field] !== undefined) return pending[partidoId][field];
    const saved = resultados[partidoId];
    if (!saved) return '';
    return String(saved[field]);
  };

  const handleChange = (partidoId, field) => (e) => {
    const value = e.target.value;
    setPending((p) => ({
      ...p,
      [partidoId]: { ...(p[partidoId] || {}), [field]: value },
    }));
    setSavedLetra(null);
  };

  const handleSaveGroup = async (letra) => {
    setSavingLetra(letra);
    try {
      const updates = {};
      for (const partido of partidosDelGrupo(letra)) {
        const gl = getInputValue(partido.id, 'golesLocal');
        const gv = getInputValue(partido.id, 'golesVisitante');
        const both = gl !== '' && gv !== '';
        const neither = gl === '' && gv === '';
        if (both) {
          updates[partido.id] = {
            golesLocal: Number(gl),
            golesVisitante: Number(gv),
          };
        } else if (neither && resultados[partido.id]) {
          // El admin ha vaciado un resultado guardado: lo borramos.
          updates[partido.id] = null;
        }
      }
      if (Object.keys(updates).length === 0) {
        setSavingLetra(null);
        return;
      }
      const data = await saveResultadosPartidos(updates);
      setResultados(data.partidos || {});
      // Limpiar los pending del grupo
      setPending((p) => {
        const next = { ...p };
        for (const partido of partidosDelGrupo(letra)) delete next[partido.id];
        return next;
      });
      setSavedLetra(letra);
      setTimeout(() => setSavedLetra((s) => (s === letra ? null : s)), 2400);
    } finally {
      setSavingLetra(null);
    }
  };

  if (loading) return <div className="admin-loading">Cargando resultados…</div>;

  const partidos = partidosDelGrupo(grupoActivo);

  return (
    <div className="admin-panel">
      <div className="admin-panel-head">
        <h2>Resultados oficiales por grupo</h2>
        <span className="admin-count">Edita y guarda cada grupo por separado</span>
      </div>

      <nav className="admin-grupos" role="tablist">
        {GRUPO_LETRAS.map((letra) => (
          <button
            key={letra}
            role="tab"
            aria-selected={grupoActivo === letra}
            className={`admin-grupo-tab ${grupoActivo === letra ? 'is-active' : ''}`}
            onClick={() => setGrupoActivo(letra)}
          >
            {letra}
          </button>
        ))}
      </nav>

      <div className="admin-grupo-content">
        <div className="admin-grupo-header">
          <h3>Grupo {grupoActivo}</h3>
          <div className="admin-grupo-actions">
            {savedLetra === grupoActivo && (
              <span className="admin-saved-pill">Guardado</span>
            )}
            <button
              type="button"
              className="btn btn-primary"
              onClick={() => handleSaveGroup(grupoActivo)}
              disabled={savingLetra === grupoActivo}
            >
              {savingLetra === grupoActivo ? 'Guardando…' : `Guardar grupo ${grupoActivo}`}
            </button>
          </div>
        </div>

        {[1, 2, 3].map((j) => {
          const partidosJ = partidos.filter((p) => p.jornada === j);
          if (partidosJ.length === 0) return null;
          return (
            <div key={j} className="admin-jornada">
              <h4 className="admin-jornada-title">Jornada {j}</h4>
              <ul className="admin-partidos">
                {partidosJ.map((p) => (
                  <li key={p.id} className="admin-partido">
                    <span className="admin-partido-fecha">{p.fecha}</span>
                    <span className="admin-partido-team admin-partido-team--local">
                      <span className="admin-partido-code">{p.local.code}</span>
                      {p.local.name}
                    </span>
                    <div className="admin-partido-score">
                      <input
                        type="number"
                        min="0"
                        max="99"
                        className="admin-score-input"
                        value={getInputValue(p.id, 'golesLocal')}
                        onChange={handleChange(p.id, 'golesLocal')}
                        aria-label={`Goles de ${p.local.name}`}
                      />
                      <span className="admin-partido-dash">—</span>
                      <input
                        type="number"
                        min="0"
                        max="99"
                        className="admin-score-input"
                        value={getInputValue(p.id, 'golesVisitante')}
                        onChange={handleChange(p.id, 'golesVisitante')}
                        aria-label={`Goles de ${p.visitante.name}`}
                      />
                    </div>
                    <span className="admin-partido-team admin-partido-team--visitante">
                      <span className="admin-partido-code">{p.visitante.code}</span>
                      {p.visitante.name}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          );
        })}

        <p className="admin-hint">
          Deja los dos campos vacíos para indicar que el partido no se ha jugado.
        </p>
      </div>
    </div>
  );
}

/* ============================================================
   Eliminatoria panel — bracket oficial
   ============================================================ */
function EliminatoriaPanel() {
  const [grupoStandings, setGrupoStandings] = useState({});
  const [ganadores, setGanadores] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savedAt, setSavedAt] = useState(null);

  useEffect(() => {
    (async () => {
      const [gru, eli] = await Promise.all([
        getResultadosGrupos(),
        getResultadosEliminatoria(),
      ]);
      setGrupoStandings(clasificacionTodosLosGrupos(gru.partidos || {}));
      setGanadores(eli.ganadores || {});
      setLoading(false);
    })();
  }, []);

  if (loading) return <div className="admin-loading">Cargando bracket…</div>;

  const handleChange = (next) => {
    setGanadores(next);
    setSavedAt(null);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await saveResultadosEliminatoria(ganadores);
      setSavedAt(Date.now());
      setTimeout(() => setSavedAt(null), 2400);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="admin-panel">
      <div className="admin-panel-head">
        <h2>Bracket oficial</h2>
        <span className="admin-count">Se rellena al cerrar la fase de grupos</span>
      </div>

      <BracketEditor
        grupoStandings={grupoStandings}
        ganadores={ganadores}
        onChange={handleChange}
      />

      <div className="admin-eli-actions">
        {savedAt && <span className="admin-saved-pill">Guardado</span>}
        <button
          type="button"
          className="btn btn-primary"
          onClick={handleSave}
          disabled={saving}
        >
          {saving ? 'Guardando…' : 'Guardar bracket oficial'}
        </button>
      </div>
    </div>
  );
}

/* ============================================================
   Premios panel — máx goleador y balones oficiales
   ============================================================ */
const PREMIO_FIELDS = [
  { key: 'maxGoleador', label: 'Máximo goleador' },
  { key: 'balonOro', label: 'Balón de Oro' },
  { key: 'balonPlata', label: 'Balón de Plata' },
  { key: 'balonBronce', label: 'Balón de Bronce' },
];

function PremiosPanel() {
  const [premios, setPremios] = useState({
    maxGoleador: '', balonOro: '', balonPlata: '', balonBronce: '',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savedAt, setSavedAt] = useState(null);

  useEffect(() => {
    (async () => {
      const data = await getResultadosPremios();
      setPremios(data);
      setLoading(false);
    })();
  }, []);

  if (loading) return <div className="admin-loading">Cargando premios…</div>;

  const handleChange = (key) => (e) => {
    setPremios((p) => ({ ...p, [key]: e.target.value }));
    setSavedAt(null);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const data = await saveResultadosPremios(premios);
      setPremios(data);
      setSavedAt(Date.now());
      setTimeout(() => setSavedAt(null), 2400);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="admin-panel">
      <div className="admin-panel-head">
        <h2>Premios oficiales</h2>
        <span className="admin-count">Apunta los ganadores al final del Mundial</span>
      </div>

      <div className="admin-premios">
        {PREMIO_FIELDS.map((f) => (
          <div key={f.key} className="admin-premio-field">
            <label className="label" htmlFor={`premio-${f.key}`}>{f.label}</label>
            <input
              id={`premio-${f.key}`}
              type="text"
              className="input"
              value={premios[f.key]}
              onChange={handleChange(f.key)}
              placeholder="Nombre del jugador"
              maxLength={80}
              autoComplete="off"
            />
          </div>
        ))}
      </div>

      <div className="admin-eli-actions">
        {savedAt && <span className="admin-saved-pill">Guardado</span>}
        <button
          type="button"
          className="btn btn-primary"
          onClick={handleSave}
          disabled={saving}
        >
          {saving ? 'Guardando…' : 'Guardar premios'}
        </button>
      </div>
    </div>
  );
}

/* ============================================================
   Torneo panel — bote total + máximo goleador actual
   ============================================================ */
function TorneoPanel() {
  const [cfg, setCfg] = useState({ maxGoleadorActual: '' });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savedAt, setSavedAt] = useState(null);

  useEffect(() => {
    (async () => {
      const data = await getTorneoConfig();
      setCfg({ maxGoleadorActual: data.maxGoleadorActual || '' });
      setLoading(false);
    })();
  }, []);

  if (loading) return <div className="admin-loading">Cargando configuración…</div>;

  const handleChange = (e) => {
    setCfg({ maxGoleadorActual: e.target.value });
    setSavedAt(null);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const data = await saveTorneoConfig(cfg);
      setCfg({ maxGoleadorActual: data.maxGoleadorActual || '' });
      setSavedAt(Date.now());
      setTimeout(() => setSavedAt(null), 2400);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="admin-panel">
      <div className="admin-panel-head">
        <h2>Máximo goleador actual</h2>
        <span className="admin-count">
          El bote se calcula automáticamente sumando los participantes pagados
        </span>
      </div>

      <div className="admin-premios">
        <div className="admin-premio-field">
          <label className="label" htmlFor="cfg-goleador">Goleador líder del torneo</label>
          <input
            id="cfg-goleador"
            type="text"
            className="input"
            value={cfg.maxGoleadorActual}
            onChange={handleChange}
            placeholder="Nombre del jugador líder"
            maxLength={80}
            autoComplete="off"
          />
        </div>
      </div>

      <div className="admin-eli-actions">
        {savedAt && <span className="admin-saved-pill">Guardado</span>}
        <button
          type="button"
          className="btn btn-primary"
          onClick={handleSave}
          disabled={saving}
        >
          {saving ? 'Guardando…' : 'Guardar'}
        </button>
      </div>
    </div>
  );
}
