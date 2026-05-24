import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import AppHeader from '../components/AppHeader.jsx';
import Avatar from '../components/Avatar.jsx';
import { AVATARS, buscarAvatar } from '../data/avatars.js';
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
      to: null, // lo gestiona el admin, no hay pantalla a la que ir
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
        done: 'Máximo goleador, balones y ganador guardados.',
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

export default function Profile() {
  const { user, patchUser } = useAuth();
  const [avatarPickerOpen, setAvatarPickerOpen] = useState(false);
  const [updating, setUpdating] = useState(false);

  if (!user) return null;

  const fechaAlta = new Date(user.createdAt).toLocaleDateString('es-ES', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  const handlePickAvatar = async (avatarId) => {
    if (avatarId === user.avatarId) {
      setAvatarPickerOpen(false);
      return;
    }
    setUpdating(true);
    try {
      await patchUser({ avatarId });
    } finally {
      setUpdating(false);
      setAvatarPickerOpen(false);
    }
  };

  const currentAvatar = buscarAvatar(user.avatarId);
  const checklist = buildChecklist(user);

  return (
    <div className="profile-page">
      <AppHeader />

      <main className="profile-main">
        <div className="container">
          {/* -------- Hero del perfil -------- */}
          <section className="profile-hero">
            <div
              className="profile-hero-bg"
              style={{ background: currentAvatar.bg }}
            />
            <div className="profile-hero-content">
              <button
                type="button"
                className="profile-avatar-wrapper"
                onClick={() => setAvatarPickerOpen(true)}
                title="Cambiar avatar"
              >
                <Avatar id={user.avatarId} size="xl" />
              </button>
              <div className="profile-hero-info">
                <div className="profile-hero-pills">
                  {user.isAdmin && (
                    <span className="profile-pill profile-pill--admin">Administrador</span>
                  )}
                  <span
                    className={`profile-pill ${user.pagado ? 'profile-pill--paid' : 'profile-pill--unpaid'}`}
                  >
                    {user.pagado ? 'Pagado' : 'Pago pendiente'}
                  </span>
                </div>
                <h1 className="profile-hero-name">
                  {user.nombre} {user.apellidos}
                </h1>
                <div className="profile-hero-nick">@{user.nickname}</div>
                <div className="profile-hero-since">Miembro desde {fechaAlta}</div>
              </div>
            </div>
          </section>

          <div className="profile-grid">
            {/* -------- Datos personales -------- */}
            <section className="profile-section">
              <header className="profile-section-header">
                <h2>Datos de la cuenta</h2>
              </header>

              <div className="profile-data-list">
                <div className="profile-data-item">
                  <span className="profile-data-label">Nombre</span>
                  <span className="profile-data-value">{user.nombre}</span>
                </div>
                <div className="profile-data-item">
                  <span className="profile-data-label">Apellidos</span>
                  <span className="profile-data-value">{user.apellidos}</span>
                </div>
                <div className="profile-data-item">
                  <span className="profile-data-label">Email</span>
                  <span className="profile-data-value">{user.email}</span>
                </div>
                <div className="profile-data-item">
                  <span className="profile-data-label">Nickname</span>
                  <span className="profile-data-value">@{user.nickname}</span>
                </div>
              </div>
            </section>

            {/* -------- Estado en la porra -------- */}
            <section className="profile-section">
              <header className="profile-section-header">
                <h2>Tu estado en la porra</h2>
              </header>

              <ol className="profile-timeline">
                {checklist.map((item, i) => (
                  <li key={item.key} className={`tl-step is-${item.state}`}>
                    <div className="tl-rail">
                      <span className="tl-dot" />
                      {i < checklist.length - 1 && <span className="tl-line" />}
                    </div>
                    <div className="tl-content">
                      <div className="tl-header">
                        <span className="tl-title">{item.title}</span>
                        {item.state === 'pending' && item.to ? (
                          <Link to={item.to} className="tl-status tl-status--link">
                            {STATE_LABEL[item.state]}
                          </Link>
                        ) : (
                          <span className="tl-status">{STATE_LABEL[item.state]}</span>
                        )}
                      </div>
                      <p className="tl-detail">{item.copy[item.state]}</p>
                    </div>
                  </li>
                ))}
              </ol>
            </section>
          </div>
        </div>
      </main>

      {/* -------- Modal selector de avatar -------- */}
      {avatarPickerOpen && (
        <div className="profile-modal-backdrop" onClick={() => setAvatarPickerOpen(false)}>
          <div className="profile-modal" onClick={(e) => e.stopPropagation()}>
            <header className="profile-modal-header">
              <div>
                <h3>Elige tu avatar</h3>
                <p className="text-secondary">
                  Selecciona el que mejor te represente en la porra.
                </p>
              </div>
              <button
                type="button"
                className="profile-modal-close"
                onClick={() => setAvatarPickerOpen(false)}
                aria-label="Cerrar"
              >
                ×
              </button>
            </header>

            <div className="profile-avatar-grid">
              {AVATARS.map((avatar) => (
                <button
                  key={avatar.id}
                  type="button"
                  className={`profile-avatar-option ${avatar.id === user.avatarId ? 'is-selected' : ''}`}
                  onClick={() => handlePickAvatar(avatar.id)}
                  disabled={updating}
                >
                  <Avatar
                    id={avatar.id}
                    size="lg"
                    selected={avatar.id === user.avatarId}
                  />
                  <span className="profile-avatar-name">{avatar.name}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
