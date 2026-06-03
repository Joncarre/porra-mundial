import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AppHeader from '../components/AppHeader.jsx';
import DeadlineNotice from '../components/DeadlineNotice.jsx';
import { GRUPO_LETRAS, partidosDelGrupo, TODOS_LOS_PARTIDOS_GRUPOS } from '../data/grupos.js';
import { getPrediccionesFase1, savePrediccionesFase1 } from '../services/predicciones.js';
import { useAuth } from '../context/AuthContext.jsx';
import { apuestasCerradas, APUESTAS_DEADLINE_LABEL } from '../utils/deadlines.js';
import './Apuestas.css';

const TOTAL_PARTIDOS = TODOS_LOS_PARTIDOS_GRUPOS.length; // 72

export default function Apuestas() {
  const { user, patchUser } = useAuth();
  const navigate = useNavigate();
  const [scores, setScores] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savedAt, setSavedAt] = useState(null);
  const [grupoActivo, setGrupoActivo] = useState('A');

  // Cargar predicciones guardadas previamente
  useEffect(() => {
    if (!user) return;
    (async () => {
      const data = await getPrediccionesFase1(user.id);
      const initial = {};
      for (const [id, r] of Object.entries(data.partidos || {})) {
        initial[id] = {
          golesLocal: String(r.golesLocal),
          golesVisitante: String(r.golesVisitante),
        };
      }
      setScores(initial);
      setLoading(false);
    })();
  }, [user]);

  /** Cuántos partidos están completamente rellenos. */
  const completados = useMemo(() => {
    let n = 0;
    for (const p of TODOS_LOS_PARTIDOS_GRUPOS) {
      const s = scores[p.id];
      if (s && s.golesLocal !== '' && s.golesVisitante !== '') n++;
    }
    return n;
  }, [scores]);

  /** Cuántos partidos completos hay por grupo (para el contador de cada tab). */
  const completadosPorGrupo = useMemo(() => {
    const acc = {};
    for (const letra of GRUPO_LETRAS) {
      acc[letra] = 0;
      for (const p of partidosDelGrupo(letra)) {
        const s = scores[p.id];
        if (s && s.golesLocal !== '' && s.golesVisitante !== '') acc[letra]++;
      }
    }
    return acc;
  }, [scores]);

  const allDone = completados === TOTAL_PARTIDOS;
  const yaCompletada = !!user?.plantillaGruposCompletada;
  const cerradas = apuestasCerradas();

  // ---------- Locks ----------
  if (!user) return null;

  if (!user.pagado) {
    return (
      <div className="ap-page">
        <AppHeader />
        <main className="ap-main">
          <div className="container">
            <LockedCard
              titulo="Las apuestas están bloqueadas"
              detalle="Aún no figuras como pagado en la porra. Habla con el administrador para que confirme tu aportación y podrás empezar a rellenar tus pronósticos."
              ctaLabel="Volver al perfil"
              ctaTo="/perfil"
            />
          </div>
        </main>
      </div>
    );
  }

  // ---------- Handlers ----------
  const handleChange = (partidoId, field) => (e) => {
    const value = e.target.value;
    setScores((s) => ({
      ...s,
      [partidoId]: { ...(s[partidoId] || { golesLocal: '', golesVisitante: '' }), [field]: value },
    }));
    setSavedAt(null);
  };

  const buildPartidosToSave = () => {
    const out = {};
    for (const p of TODOS_LOS_PARTIDOS_GRUPOS) {
      const s = scores[p.id];
      if (s && s.golesLocal !== '' && s.golesVisitante !== '') {
        out[p.id] = {
          golesLocal: Number(s.golesLocal),
          golesVisitante: Number(s.golesVisitante),
        };
      }
    }
    return out;
  };

  const handleSaveProgress = async () => {
    setSaving(true);
    try {
      await savePrediccionesFase1(user.id, buildPartidosToSave());
      setSavedAt(Date.now());
      setTimeout(() => setSavedAt(null), 2400);
    } finally {
      setSaving(false);
    }
  };

  const handleConfirm = async () => {
    if (!allDone) return;
    setSaving(true);
    try {
      await savePrediccionesFase1(user.id, buildPartidosToSave());
      await patchUser({ plantillaGruposCompletada: true });
      navigate('/perfil');
    } finally {
      setSaving(false);
    }
  };

  // ---------- Render ----------
  const partidos = partidosDelGrupo(grupoActivo);

  return (
    <div className="ap-page">
      <AppHeader />
      <main className="ap-main">
        <div className="container">
          <header className="ap-page-header">
            <span className="eyebrow">Apuestas — fase de grupos</span>
            <h1 className="ap-page-title">Rellena tus pronósticos</h1>
            <p className="ap-page-sub">
              Predice el resultado exacto de los 72 partidos de la fase de grupos.
              Puedes ir guardando tu progreso y volver más tarde.
            </p>
          </header>

          {loading ? (
            <div className="ap-loading">Cargando tus apuestas…</div>
          ) : (
            <div className="ap-panel">
              <DeadlineNotice />

              {/* Progreso global */}
              <div className="ap-progress">
                <div className="ap-progress-text">
                  <span className="ap-progress-count">{completados}</span>
                  <span className="ap-progress-total"> / {TOTAL_PARTIDOS} partidos</span>
                </div>
                <div className="ap-progress-bar">
                  <div
                    className="ap-progress-fill"
                    style={{ width: `${(completados / TOTAL_PARTIDOS) * 100}%` }}
                  />
                </div>
              </div>

              {/* Tabs A-L con contador por grupo */}
              <nav className="ap-grupos" role="tablist">
                {GRUPO_LETRAS.map((letra) => {
                  const done = completadosPorGrupo[letra];
                  const isComplete = done === 6;
                  return (
                    <button
                      key={letra}
                      role="tab"
                      aria-selected={grupoActivo === letra}
                      className={`ap-grupo-tab ${grupoActivo === letra ? 'is-active' : ''} ${isComplete ? 'is-complete' : ''}`}
                      onClick={() => setGrupoActivo(letra)}
                    >
                      <span className="ap-grupo-tab-letter">{letra}</span>
                      <span className="ap-grupo-tab-count">{done}/6</span>
                    </button>
                  );
                })}
              </nav>

              {/* Lista de partidos del grupo activo */}
              <div className="ap-grupo-content">
                <h3 className="ap-grupo-title">Grupo {grupoActivo}</h3>
                {[1, 2, 3].map((j) => {
                  const partidosJ = partidos.filter((p) => p.jornada === j);
                  if (partidosJ.length === 0) return null;
                  return (
                    <div key={j} className="ap-jornada">
                      <h4 className="ap-jornada-title">Jornada {j}</h4>
                      <ul className="ap-partidos">
                        {partidosJ.map((p) => {
                          const s = scores[p.id] || { golesLocal: '', golesVisitante: '' };
                          return (
                            <li key={p.id} className="ap-partido">
                              <span className="ap-partido-fecha">{p.fecha}</span>
                              <span className="ap-partido-team ap-partido-team--local">
                                <span className="ap-partido-code">{p.local.code}</span>
                                {p.local.name}
                              </span>
                              <div className="ap-partido-score">
                                <input
                                  type="number"
                                  min="0"
                                  max="99"
                                  className="ap-score-input"
                                  value={s.golesLocal}
                                  onChange={handleChange(p.id, 'golesLocal')}
                                  disabled={cerradas}
                                  aria-label={`Tu predicción de goles de ${p.local.name}`}
                                />
                                <span className="ap-partido-dash">—</span>
                                <input
                                  type="number"
                                  min="0"
                                  max="99"
                                  className="ap-score-input"
                                  value={s.golesVisitante}
                                  onChange={handleChange(p.id, 'golesVisitante')}
                                  disabled={cerradas}
                                  aria-label={`Tu predicción de goles de ${p.visitante.name}`}
                                />
                              </div>
                              <span className="ap-partido-team ap-partido-team--visitante">
                                <span className="ap-partido-code">{p.visitante.code}</span>
                                {p.visitante.name}
                              </span>
                            </li>
                          );
                        })}
                      </ul>
                    </div>
                  );
                })}
              </div>

              {/* Acciones */}
              {cerradas ? (
                <footer className="ap-actions ap-actions--cerradas">
                  <span className="ap-cerradas-notice">
                    Las apuestas se cerraron el {APUESTAS_DEADLINE_LABEL}. Tus
                    pronósticos quedan como estaban guardados.
                  </span>
                </footer>
              ) : (
                <footer className="ap-actions">
                  {savedAt && <span className="ap-saved-pill">Progreso guardado</span>}
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={handleSaveProgress}
                    disabled={saving}
                  >
                    {saving ? 'Guardando…' : 'Guardar progreso'}
                  </button>
                  <button
                    type="button"
                    className="btn btn-primary"
                    onClick={handleConfirm}
                    disabled={saving || !allDone}
                    title={!allDone ? `Te faltan ${TOTAL_PARTIDOS - completados} partidos por rellenar` : undefined}
                  >
                    {allDone ? 'Confirmar todas mis apuestas' : `Faltan ${TOTAL_PARTIDOS - completados} partidos`}
                  </button>
                </footer>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

/* ============================================================
   Sub-componente: card bloqueada
   ============================================================ */
function LockedCard({ titulo, detalle, ctaLabel, ctaTo }) {
  return (
    <div className="ap-locked">
      <span className="eyebrow">Acceso bloqueado</span>
      <h2 className="ap-locked-title">{titulo}</h2>
      <p className="ap-locked-detail">{detalle}</p>
      <Link to={ctaTo} className="btn btn-primary btn-lg">{ctaLabel}</Link>
    </div>
  );
}
