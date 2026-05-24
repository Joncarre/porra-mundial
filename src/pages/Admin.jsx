import { useEffect, useMemo, useState } from 'react';
import AppHeader from '../components/AppHeader.jsx';
import Avatar from '../components/Avatar.jsx';
import BracketEditor from '../components/BracketEditor.jsx';
import { getAllUsers, updateUser } from '../services/users.js';
import {
  getResultadosGrupos,
  saveResultadosPartidos,
  getResultadosEliminatoria,
  saveResultadosEliminatoria,
} from '../services/resultados.js';
import { GRUPO_LETRAS, partidosDelGrupo } from '../data/grupos.js';
import { clasificacionTodosLosGrupos, bracketCompleto, progresoBracket } from '../utils/bracket.js';
import { useAuth } from '../context/AuthContext.jsx';
import './Admin.css';

const TABS = [
  { id: 'usuarios', label: 'Usuarios' },
  { id: 'resultados', label: 'Resultados de grupos' },
  { id: 'eliminatoria', label: 'Eliminatoria' },
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
          {tab === 'resultados' && <ResultsPanel />}
          {tab === 'eliminatoria' && <EliminatoriaPanel />}
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
            <Avatar id={u.avatarId} size="md" />
            <div className="admin-user-info">
              <div className="admin-user-name">
                {u.nombre} {u.apellidos}
              </div>
              <div className="admin-user-meta">
                @{u.nickname} · {u.email}
              </div>
            </div>
            <div className="admin-user-toggles">
              <ToggleRow
                label="Pagado"
                checked={u.pagado}
                onClick={() => handleToggle(u.id, 'pagado')}
                disabled={updatingId === u.id}
              />
              <ToggleRow
                label="Admin"
                checked={u.isAdmin}
                onClick={() => handleToggle(u.id, 'isAdmin')}
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

        <ul className="admin-partidos">
          {partidos.map((p) => (
            <li key={p.id} className="admin-partido">
              <span className="admin-partido-team admin-partido-team--local">
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
                {p.visitante.name}
              </span>
            </li>
          ))}
        </ul>

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

  const { picksHechos, totalPicks } = useMemo(() => {
    const bracket = bracketCompleto(grupoStandings, ganadores);
    const p = progresoBracket(bracket, ganadores);
    return {
      totalPicks: p.d32.total + p.o16.total + p.qf.total + p.sf.total + p.tercer.total + p.final.total,
      picksHechos: p.d32.hechos + p.o16.hechos + p.qf.hechos + p.sf.hechos + p.tercer.hechos + p.final.hechos,
    };
  }, [grupoStandings, ganadores]);

  const algunPartidoEnGrupos = Object.values(grupoStandings).some((tabla) =>
    (tabla || []).some((e) => e.pj > 0),
  );

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
        <span className="admin-count">{picksHechos} / {totalPicks || 32} cruces decididos</span>
      </div>

      {!algunPartidoEnGrupos && (
        <div className="admin-eli-warning">
          Todavía no has registrado ningún resultado de la fase de grupos. Las
          tarjetas mostrarán "Por decidir" hasta que el bracket pueda calcularse.
        </div>
      )}

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
