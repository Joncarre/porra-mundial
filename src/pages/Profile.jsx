import { useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import AppHeader from '../components/AppHeader.jsx';
import Avatar from '../components/Avatar.jsx';
import { fileToResizedDataUrl } from '../utils/image.js';
import './Profile.css';

/**
 * Construye el checklist con dependencias secuenciales.
 * Flujo: pago → fase grupos → eliminatoria → otras apuestas.
 * Cada plantilla está bloqueada hasta que la anterior esté completada.
 */
function buildChecklist(user) {
  const pago = !!user.pagado;
  const grupos = !!user.plantillaGruposCompletada;
  const elim = !!user.plantillaEliminatoriaCompletada;
  const otras = !!user.plantillaOtrasApuestasCompletada;

  const stateOf = (done, prevDone) => {
    if (done) return 'done';
    if (!prevDone) return 'locked';
    return 'pending';
  };

  return [
    {
      key: 'pago',
      title: 'Pago de la porra',
      state: pago ? 'done' : 'pending',
      to: null,
      copy: {
        done: 'Confirmado por el administrador.',
        pending: 'Habla con el admin para pagar tu cuota.',
      },
    },
    {
      key: 'grupos',
      title: 'Plantilla fase de grupos',
      state: stateOf(grupos, pago),
      to: '/apuestas',
      copy: {
        done: 'Pronósticos guardados.',
        pending: 'Lista para rellenar.',
        locked: 'Se desbloquea al confirmar el pago.',
      },
    },
    {
      key: 'eliminatoria',
      title: 'Plantilla eliminatoria',
      state: stateOf(elim, grupos),
      to: '/bracket',
      copy: {
        done: 'Bracket completado.',
        pending: 'Lista para rellenar.',
        locked: 'Se desbloquea al completar la fase de grupos.',
      },
    },
    {
      key: 'apuestas',
      title: 'Plantilla otras apuestas',
      state: stateOf(otras, elim),
      to: '/extras',
      copy: {
        done: 'Máximo goleador y balones.',
        pending: 'Lista para rellenar.',
        locked: 'Se desbloquea al completar el bracket eliminatorio.',
      },
    },
  ];
}

const STATE_LABEL = {
  done: 'Completado',
  pending: 'Pendiente',
  locked: 'Bloqueado',
};

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB

// Radio del anillo de progreso (debe coincidir con el r= del <circle>).
const RING_R = 77;
const RING_CIRC = 2 * Math.PI * RING_R;

export default function Profile() {
  const { user, patchUser } = useAuth();
  const [pickerOpen, setPickerOpen] = useState(false);
  const [preview, setPreview] = useState(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const fileRef = useRef(null);

  if (!user) return null;

  const fechaAlta = new Date(user.createdAt).toLocaleDateString('es-ES', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  const openPicker = () => {
    setPreview(null);
    setError('');
    setPickerOpen(true);
  };

  const closePicker = () => {
    setPickerOpen(false);
    setPreview(null);
    setError('');
    if (fileRef.current) fileRef.current.value = '';
  };

  const handleFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setError('');

    if (!file.type.startsWith('image/')) {
      setError('El archivo debe ser una imagen.');
      return;
    }
    if (file.size > MAX_FILE_SIZE) {
      setError('La imagen es demasiado grande (máximo 5 MB).');
      return;
    }
    try {
      const dataUrl = await fileToResizedDataUrl(file, 240);
      setPreview(dataUrl);
    } catch {
      setError('No se pudo procesar la imagen.');
    }
  };

  const handleSave = async () => {
    if (!preview) return;
    setSaving(true);
    try {
      await patchUser({ avatarFoto: preview });
      closePicker();
    } catch {
      setError('No se pudo guardar la foto.');
    } finally {
      setSaving(false);
    }
  };

  const handleRemove = async () => {
    setSaving(true);
    try {
      await patchUser({ avatarFoto: null });
      closePicker();
    } catch {
      setError('No se pudo eliminar la foto.');
    } finally {
      setSaving(false);
    }
  };

  const checklist = buildChecklist(user);
  const previewing = !!preview;
  const completados = checklist.filter((c) => c.state === 'done').length;
  const totalPasos = checklist.length;

  return (
    <div className="profile-page">
      <AppHeader />

      <main className="profile-main">
        <div className="container">
          {/* -------- Hero del perfil -------- */}
          <section className="profile-hero">
            <span className="profile-hero-glow" aria-hidden="true" />
            <div className="profile-hero-content">
              <button
                type="button"
                className="profile-avatar-wrapper"
                onClick={openPicker}
                title="Cambiar foto"
              >
                <span className="profile-avatar-ring">
                  <Avatar
                    foto={user.avatarFoto}
                    name={user.nombre || user.nickname}
                    size="xl"
                  />
                </span>
                <span className="profile-avatar-edit">Cambiar foto</span>
              </button>
              <div className="profile-hero-info">
                <span className="eyebrow">Mi perfil</span>
                <h1 className="profile-hero-name">
                  {user.nombre} {user.apellidos}
                </h1>
                <div className="profile-hero-nick">@{user.nickname}</div>
                <div className="profile-hero-meta">
                  {user.isAdmin ? (
                    <span className="profile-pill profile-pill--admin">Administrador</span>
                  ) : (
                    <span
                      className={`profile-pill ${user.pagado ? 'profile-pill--paid' : 'profile-pill--unpaid'}`}
                    >
                      {user.pagado ? 'Pagado' : 'Pago pendiente'}
                    </span>
                  )}
                  <span className="profile-hero-since">Miembro desde {fechaAlta}</span>
                </div>
              </div>
            </div>
          </section>

          {/* -------- Estado en la porra (solo participantes) -------- */}
          {!user.isAdmin && (
            <section className="profile-journey">
              <header className="profile-journey-head">
                <span className="eyebrow">Tu progreso</span>
                <h2 className="profile-journey-title">Tu camino en la porra</h2>
              </header>

              <div className="profile-journey-body">
                <div
                  className="profile-ring"
                  role="progressbar"
                  aria-valuenow={completados}
                  aria-valuemin={0}
                  aria-valuemax={totalPasos}
                  aria-label={`${completados} de ${totalPasos} pasos completados`}
                >
                  <svg viewBox="0 0 168 168" className="profile-ring-svg" aria-hidden="true">
                    <defs>
                      <linearGradient id="profileRingGold" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#d8b67a" />
                        <stop offset="55%" stopColor="#b8945a" />
                        <stop offset="100%" stopColor="#9b7838" />
                      </linearGradient>
                    </defs>
                    <circle className="profile-ring-track" cx="84" cy="84" r="77" />
                    <circle
                      className="profile-ring-fill"
                      cx="84"
                      cy="84"
                      r="77"
                      style={{
                        strokeDasharray: RING_CIRC,
                        strokeDashoffset: RING_CIRC * (1 - completados / totalPasos),
                      }}
                    />
                  </svg>
                  <div className="profile-ring-center">
                    <span className="profile-ring-value">
                      {completados}<span>/{totalPasos}</span>
                    </span>
                    <span className="profile-ring-label">completado</span>
                  </div>
                </div>

                <ol className="profile-journey-steps">
                  {checklist.map((item) => (
                    <li key={item.key} className={`jstep is-${item.state}`}>
                      <span className="jstep-marker" />
                      <div className="jstep-body">
                        <div className="jstep-top">
                          <span className="jstep-title">{item.title}</span>
                          {item.state === 'done' ? null : item.state === 'pending' && item.to ? (
                            <Link to={item.to} className="jstep-status jstep-status--link">
                              {STATE_LABEL[item.state]}
                            </Link>
                          ) : (
                            <span className="jstep-status">{STATE_LABEL[item.state]}</span>
                          )}
                        </div>
                        <p className="jstep-detail">{item.copy[item.state]}</p>
                      </div>
                    </li>
                  ))}
                </ol>
              </div>
            </section>
          )}
        </div>
      </main>

      {/* -------- Modal de subida de foto -------- */}
      {pickerOpen && (
        <div className="profile-modal-backdrop" onClick={closePicker}>
          <div className="profile-modal" onClick={(e) => e.stopPropagation()}>
            <header className="profile-modal-header">
              <div>
                <h3>Foto de perfil</h3>
                <p className="text-secondary">
                  Sube una imagen desde tu galería.
                </p>
              </div>
              <button
                type="button"
                className="profile-modal-close"
                onClick={closePicker}
                aria-label="Cerrar"
              >
                ×
              </button>
            </header>

            <div className="profile-upload">
              <div className="profile-upload-preview">
                <Avatar
                  foto={preview || user.avatarFoto}
                  name={user.nombre || user.nickname}
                  size={180}
                />
              </div>

              {error && <div className="profile-upload-error">{error}</div>}

              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                hidden
                onChange={handleFile}
              />

              <div className="profile-upload-actions">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => fileRef.current?.click()}
                  disabled={saving}
                >
                  {previewing ? 'Elegir otra imagen' : 'Elegir imagen'}
                </button>

                {previewing ? (
                  <button
                    type="button"
                    className="btn btn-primary"
                    onClick={handleSave}
                    disabled={saving}
                  >
                    {saving ? 'Guardando…' : 'Guardar foto'}
                  </button>
                ) : (
                  user.avatarFoto && (
                    <button
                      type="button"
                      className="btn btn-secondary profile-upload-remove"
                      onClick={handleRemove}
                      disabled={saving}
                    >
                      {saving ? 'Eliminando…' : 'Eliminar foto'}
                    </button>
                  )
                )}
              </div>

              <p className="profile-upload-hint">
                Formatos JPG, PNG, WebP… Tamaño máximo 5 MB.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
