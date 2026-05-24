import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AppHeader from '../components/AppHeader.jsx';
import BracketEditor from '../components/BracketEditor.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import {
  getPrediccionesFase1,
  getPrediccionesFase2,
  savePrediccionesFase2,
} from '../services/predicciones.js';
import { clasificacionTodosLosGrupos, bracketCompleto, progresoBracket } from '../utils/bracket.js';
import { apuestasCerradas, APUESTAS_DEADLINE_LABEL } from '../utils/deadlines.js';
import './Bracket.css';

export default function Bracket() {
  const { user, patchUser } = useAuth();
  const navigate = useNavigate();
  const [grupoStandings, setGrupoStandings] = useState({});
  const [ganadores, setGanadores] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savedAt, setSavedAt] = useState(null);

  useEffect(() => {
    if (!user) return;
    if (!user.pagado || !user.plantillaGruposCompletada) {
      setLoading(false);
      return;
    }
    (async () => {
      const [f1, f2] = await Promise.all([
        getPrediccionesFase1(user.id),
        getPrediccionesFase2(user.id),
      ]);
      setGrupoStandings(clasificacionTodosLosGrupos(f1.partidos || {}));
      setGanadores(f2.ganadores || {});
      setLoading(false);
    })();
  }, [user]);

  /** Total de partidos del bracket: 16 + 8 + 4 + 2 + 1 (3.º) + 1 (final) = 32. */
  const { totalPicks, picksHechos, allDone } = useMemo(() => {
    const bracket = bracketCompleto(grupoStandings, ganadores);
    const p = progresoBracket(bracket, ganadores);
    const total = p.d32.total + p.o16.total + p.qf.total + p.sf.total + p.tercer.total + p.final.total;
    const done = p.d32.hechos + p.o16.hechos + p.qf.hechos + p.sf.hechos + p.tercer.hechos + p.final.hechos;
    return { totalPicks: total, picksHechos: done, allDone: total > 0 && done === total };
  }, [grupoStandings, ganadores]);

  if (!user) return null;

  // ---------- Locks ----------
  if (!user.pagado) {
    return (
      <LockedPage
        titulo="El bracket está bloqueado"
        detalle="Aún no figuras como pagado en la porra. Habla con el administrador para que confirme tu aportación."
      />
    );
  }
  if (!user.plantillaGruposCompletada) {
    return (
      <LockedPage
        titulo="Primero termina la fase de grupos"
        detalle="El bracket se construye a partir de tus propios pronósticos de grupos. Confírmalos para desbloquearlo."
        ctaLabel="Ir a apuestas de grupos"
        ctaTo="/apuestas"
      />
    );
  }

  // ---------- Handlers ----------
  const handleChange = (next) => {
    setGanadores(next);
    setSavedAt(null);
  };

  const handleSaveProgress = async () => {
    setSaving(true);
    try {
      await savePrediccionesFase2(user.id, ganadores);
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
      await savePrediccionesFase2(user.id, ganadores);
      await patchUser({ plantillaEliminatoriaCompletada: true });
      navigate('/perfil');
    } finally {
      setSaving(false);
    }
  };

  const yaCompletada = !!user.plantillaEliminatoriaCompletada;
  const cerradas = apuestasCerradas();

  return (
    <div className="brk-page">
      <AppHeader />
      <main className="brk-main">
        <div className="container">
          <header className="brk-page-header">
            <span className="eyebrow">Apuestas — fase eliminatoria</span>
            <h1 className="brk-page-title">Completa tu bracket</h1>
            <p className="brk-page-sub">
              Los equipos que llegan a cada cruce se calculan a partir de tus
              propios pronósticos de la fase de grupos. Pulsa sobre el equipo
              que crees que avanza.
            </p>
            {yaCompletada && (
              <div className="brk-already-pill">
                Ya confirmaste tu bracket — los cambios que hagas aquí se irán
                guardando igualmente.
              </div>
            )}
          </header>

          {loading ? (
            <div className="brk-loading">Cargando tu bracket…</div>
          ) : (
            <div className="brk-panel">
              <div className="brk-progress">
                <div className="brk-progress-text">
                  <span className="brk-progress-count">{picksHechos}</span>
                  <span className="brk-progress-total"> / {totalPicks} cruces decididos</span>
                </div>
                <div className="brk-progress-bar">
                  <div
                    className="brk-progress-fill"
                    style={{ width: `${totalPicks > 0 ? (picksHechos / totalPicks) * 100 : 0}%` }}
                  />
                </div>
              </div>

              <BracketEditor
                grupoStandings={grupoStandings}
                ganadores={ganadores}
                onChange={handleChange}
                readOnly={cerradas}
              />

              {cerradas ? (
                <footer className="brk-actions brk-actions--cerradas">
                  <span className="brk-cerradas-notice">
                    Las apuestas se cerraron el {APUESTAS_DEADLINE_LABEL}. Tu
                    bracket queda como estaba guardado.
                  </span>
                </footer>
              ) : (
                <footer className="brk-actions">
                  {savedAt && <span className="brk-saved-pill">Progreso guardado</span>}
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
                    title={!allDone ? `Faltan ${totalPicks - picksHechos} cruces por decidir` : undefined}
                  >
                    {allDone
                      ? 'Confirmar mi bracket'
                      : `Faltan ${totalPicks - picksHechos} cruces`}
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
   Página bloqueada (sin pago o sin grupos)
   ============================================================ */
function LockedPage({ titulo, detalle, ctaLabel = 'Volver al perfil', ctaTo = '/perfil' }) {
  return (
    <div className="brk-page">
      <AppHeader />
      <main className="brk-main">
        <div className="container">
          <div className="brk-locked">
            <span className="eyebrow">Acceso bloqueado</span>
            <h2 className="brk-locked-title">{titulo}</h2>
            <p className="brk-locked-detail">{detalle}</p>
            <Link to={ctaTo} className="btn btn-primary btn-lg">{ctaLabel}</Link>
          </div>
        </div>
      </main>
    </div>
  );
}
