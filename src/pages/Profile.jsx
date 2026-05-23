import { useState } from 'react';
import {
  Mail,
  AtSign,
  User as UserIcon,
  Pencil,
  CheckCircle2,
  Circle,
  CreditCard,
  Target,
  Trophy,
  Award,
  Calendar,
  X,
  Settings,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import AppHeader from '../components/AppHeader.jsx';
import Avatar from '../components/Avatar.jsx';
import { AVATARS, buscarAvatar } from '../data/avatars.js';
import './Profile.css';

export default function Profile() {
  const { user, patchUser } = useAuth();
  const [avatarPickerOpen, setAvatarPickerOpen] = useState(false);
  const [updating, setUpdating] = useState(false);

  if (!user) return null; // ProtectedRoute ya redirige, esta línea es por seguridad.

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

  /** Resumen del estado de las 3 plantillas + pago. */
  const checklist = [
    {
      key: 'pago',
      title: 'Pago de la porra',
      detail: 'Confirmado por el administrador al recibir tu aportación.',
      icon: CreditCard,
      done: !!user.pagado,
      pendingHint: 'Pendiente — habla con el admin para pagar tu cuota.',
    },
    {
      key: 'grupos',
      title: 'Plantilla fase de grupos',
      detail: 'Pronósticos de los 72 partidos de la fase de grupos.',
      icon: Target,
      done: !!user.plantillaGruposCompletada,
      pendingHint: 'Disponible próximamente.',
    },
    {
      key: 'eliminatoria',
      title: 'Plantilla eliminatoria',
      detail: 'Bracket completo desde dieciseisavos hasta la final.',
      icon: Trophy,
      done: !!user.plantillaEliminatoriaCompletada,
      pendingHint: 'Se habilita el 28 de junio de 2026.',
    },
    {
      key: 'apuestas',
      title: 'Plantilla otras apuestas',
      detail: 'Máximo goleador, balones de oro/plata/bronce, 3.º y 4.º puesto y ganador.',
      icon: Award,
      done: !!user.plantillaOtrasApuestasCompletada,
      pendingHint: 'Disponible próximamente.',
    },
  ];

  return (
    <div className="profile-page">
      <AppHeader />

      <main className="profile-main">
        <div className="container">
          {/* -------- Hero del perfil -------- */}
          <section className="profile-hero card-elevated">
            <div className="profile-hero-bg" style={{ backgroundImage: currentAvatar.gradient }} />
            <div className="profile-hero-content">
              <div className="profile-avatar-wrapper">
                <Avatar id={user.avatarId} size="xl" />
                <button
                  type="button"
                  className="profile-avatar-edit"
                  onClick={() => setAvatarPickerOpen(true)}
                  title="Cambiar avatar"
                >
                  <Pencil size={14} />
                </button>
              </div>
              <div className="profile-hero-info">
                <div className="profile-hero-meta">
                  <span className="badge">
                    {user.isAdmin ? <><Settings size={12} /> Administrador</> : 'Participante'}
                  </span>
                </div>
                <h1 className="profile-hero-name">
                  {user.nombre} {user.apellidos}
                </h1>
                <div className="profile-hero-nick">
                  <AtSign size={14} /> {user.nickname}
                </div>
                <div className="profile-hero-since">
                  <Calendar size={14} /> Miembro desde {fechaAlta}
                </div>
              </div>
            </div>
          </section>

          <div className="profile-grid">
            {/* -------- Datos personales -------- */}
            <section className="profile-section">
              <header className="profile-section-header">
                <UserIcon size={18} className="profile-section-icon" />
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
                  <span className="profile-data-label">
                    <Mail size={13} /> Email
                  </span>
                  <span className="profile-data-value">{user.email}</span>
                </div>
                <div className="profile-data-item">
                  <span className="profile-data-label">
                    <AtSign size={13} /> Nickname
                  </span>
                  <span className="profile-data-value">{user.nickname}</span>
                </div>
              </div>
            </section>

            {/* -------- Estado en la porra -------- */}
            <section className="profile-section">
              <header className="profile-section-header">
                <CheckCircle2 size={18} className="profile-section-icon" />
                <h2>Tu estado en la porra</h2>
              </header>

              <div className="profile-checklist">
                {checklist.map((item) => {
                  const Icon = item.icon;
                  return (
                    <div
                      key={item.key}
                      className={`profile-check ${item.done ? 'is-done' : 'is-pending'}`}
                    >
                      <div className="profile-check-icon">
                        <Icon size={18} />
                      </div>
                      <div className="profile-check-body">
                        <div className="profile-check-title">{item.title}</div>
                        <div className="profile-check-detail">
                          {item.done ? item.detail : item.pendingHint}
                        </div>
                      </div>
                      <div className="profile-check-status">
                        {item.done ? (
                          <CheckCircle2 size={20} className="profile-check-mark" />
                        ) : (
                          <Circle size={20} className="profile-check-pending" />
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
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
                  Selecciona el avatar que mejor te represente en la porra.
                </p>
              </div>
              <button
                type="button"
                className="profile-modal-close"
                onClick={() => setAvatarPickerOpen(false)}
                aria-label="Cerrar"
              >
                <X size={18} />
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
                  <Avatar id={avatar.id} size="lg" selected={avatar.id === user.avatarId} />
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
