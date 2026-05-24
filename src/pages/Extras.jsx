import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AppHeader from '../components/AppHeader.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import {
  getPrediccionesExtras,
  savePrediccionesExtras,
} from '../services/predicciones.js';
import './Extras.css';

const CAMPOS = [
  {
    key: 'maxGoleador',
    label: 'Máximo goleador',
    placeholder: 'Nombre del jugador',
    hint: 'El máximo anotador del torneo.',
  },
  {
    key: 'balonOro',
    label: 'Balón de Oro',
    placeholder: 'Nombre del jugador',
    hint: 'El mejor jugador del Mundial.',
  },
  {
    key: 'balonPlata',
    label: 'Balón de Plata',
    placeholder: 'Nombre del jugador',
    hint: 'El segundo mejor.',
  },
  {
    key: 'balonBronce',
    label: 'Balón de Bronce',
    placeholder: 'Nombre del jugador',
    hint: 'El tercero.',
  },
];

const EMPTY = { maxGoleador: '', balonOro: '', balonPlata: '', balonBronce: '' };

export default function Extras() {
  const { user, patchUser } = useAuth();
  const navigate = useNavigate();
  const [extras, setExtras] = useState(EMPTY);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savedAt, setSavedAt] = useState(null);

  useEffect(() => {
    if (!user) return;
    if (
      !user.pagado ||
      !user.plantillaGruposCompletada ||
      !user.plantillaEliminatoriaCompletada
    ) {
      setLoading(false);
      return;
    }
    (async () => {
      const data = await getPrediccionesExtras(user.id);
      setExtras(data);
      setLoading(false);
    })();
  }, [user]);

  const completados = useMemo(
    () => CAMPOS.filter((c) => extras[c.key]?.trim()).length,
    [extras],
  );
  const allDone = completados === CAMPOS.length;

  if (!user) return null;

  // ---------- Locks ----------
  if (!user.pagado) {
    return (
      <LockedPage
        titulo="Tus otras apuestas están bloqueadas"
        detalle="Aún no figuras como pagado en la porra. Habla con el administrador para que confirme tu aportación."
      />
    );
  }
  if (!user.plantillaGruposCompletada) {
    return (
      <LockedPage
        titulo="Primero termina la fase de grupos"
        detalle="Confirma tus pronósticos de grupos para avanzar al bracket y a las apuestas finales."
        ctaLabel="Ir a apuestas de grupos"
        ctaTo="/apuestas"
      />
    );
  }
  if (!user.plantillaEliminatoriaCompletada) {
    return (
      <LockedPage
        titulo="Primero confirma tu bracket"
        detalle="Cuando termines tu cuadro eliminatorio podrás rellenar el máximo goleador y los tres balones."
        ctaLabel="Ir al bracket"
        ctaTo="/bracket"
      />
    );
  }

  // ---------- Handlers ----------
  const handleChange = (key) => (e) => {
    setExtras((x) => ({ ...x, [key]: e.target.value }));
    setSavedAt(null);
  };

  const handleSaveProgress = async () => {
    setSaving(true);
    try {
      await savePrediccionesExtras(user.id, extras);
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
      await savePrediccionesExtras(user.id, extras);
      await patchUser({ plantillaOtrasApuestasCompletada: true });
      navigate('/perfil');
    } finally {
      setSaving(false);
    }
  };

  const yaCompletada = !!user.plantillaOtrasApuestasCompletada;

  return (
    <div className="ex-page">
      <AppHeader />
      <main className="ex-main">
        <div className="container">
          <header className="ex-page-header">
            <span className="eyebrow">Apuestas — premios individuales</span>
            <h1 className="ex-page-title">Otras apuestas</h1>
            <p className="ex-page-sub">
              Las apuestas que pueden marcar la diferencia: el máximo goleador
              del torneo y los tres mejores jugadores del Mundial.
            </p>
            {yaCompletada && (
              <div className="ex-already-pill">
                Ya confirmaste tus apuestas — los cambios que hagas aquí se irán
                guardando igualmente.
              </div>
            )}
          </header>

          {loading ? (
            <div className="ex-loading">Cargando tus apuestas…</div>
          ) : (
            <div className="ex-panel">
              <div className="ex-progress">
                <div className="ex-progress-text">
                  <span className="ex-progress-count">{completados}</span>
                  <span className="ex-progress-total"> / {CAMPOS.length} apuestas</span>
                </div>
                <div className="ex-progress-bar">
                  <div
                    className="ex-progress-fill"
                    style={{ width: `${(completados / CAMPOS.length) * 100}%` }}
                  />
                </div>
              </div>

              <div className="ex-fields">
                {CAMPOS.map((c) => (
                  <div key={c.key} className="ex-field">
                    <label className="label" htmlFor={c.key}>{c.label}</label>
                    <input
                      id={c.key}
                      className="input"
                      type="text"
                      placeholder={c.placeholder}
                      value={extras[c.key]}
                      onChange={handleChange(c.key)}
                      maxLength={80}
                      autoComplete="off"
                    />
                    <span className="ex-field-hint">{c.hint}</span>
                  </div>
                ))}
              </div>

              <footer className="ex-actions">
                {savedAt && <span className="ex-saved-pill">Progreso guardado</span>}
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
                  title={!allDone ? `Faltan ${CAMPOS.length - completados} apuestas por rellenar` : undefined}
                >
                  {allDone
                    ? 'Confirmar mis apuestas'
                    : `Faltan ${CAMPOS.length - completados} apuestas`}
                </button>
              </footer>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

function LockedPage({ titulo, detalle, ctaLabel = 'Volver al perfil', ctaTo = '/perfil' }) {
  return (
    <div className="ex-page">
      <AppHeader />
      <main className="ex-main">
        <div className="container">
          <div className="ex-locked">
            <span className="eyebrow">Acceso bloqueado</span>
            <h2 className="ex-locked-title">{titulo}</h2>
            <p className="ex-locked-detail">{detalle}</p>
            <Link to={ctaTo} className="btn btn-primary btn-lg">{ctaLabel}</Link>
          </div>
        </div>
      </main>
    </div>
  );
}
