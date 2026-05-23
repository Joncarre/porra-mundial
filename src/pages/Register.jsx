import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Trophy,
  UserPlus,
  Mail,
  User,
  AtSign,
  Lock,
  AlertCircle,
  CheckCircle2,
  ArrowLeft,
} from 'lucide-react';
import { createUser } from '../services/users.js';
import './auth.css';

const INITIAL = {
  nombre: '',
  apellidos: '',
  email: '',
  nickname: '',
  password: '',
  passwordConfirm: '',
};

export default function Register() {
  const navigate = useNavigate();
  const [form, setForm] = useState(INITIAL);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const updateField = (field) => (e) => {
    setForm((f) => ({ ...f, [field]: e.target.value }));
  };

  const validate = () => {
    if (!form.nombre.trim()) return 'El nombre es obligatorio.';
    if (!form.apellidos.trim()) return 'Los apellidos son obligatorios.';
    if (!form.email.trim()) return 'El email es obligatorio.';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) return 'El email no tiene un formato válido.';
    if (form.nickname.trim().length < 3) return 'El nickname debe tener al menos 3 caracteres.';
    if (form.password.length < 6) return 'La contraseña debe tener al menos 6 caracteres.';
    if (form.password !== form.passwordConfirm) return 'Las contraseñas no coinciden.';
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }
    setSubmitting(true);
    try {
      await createUser({
        nombre: form.nombre,
        apellidos: form.apellidos,
        email: form.email,
        nickname: form.nickname,
        password: form.password,
      });
      setSuccess(true);
    } catch (err) {
      setError(err.message || 'No se pudo completar el registro.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="auth-page">
      {/* Top bar */}
      <div className="auth-topbar">
        <div className="container auth-topbar-inner">
          <Link to="/" className="btn btn-ghost">
            <ArrowLeft size={16} /> Volver
          </Link>
          <Link to="/" className="auth-brand">
            <div className="auth-brand-mark"><Trophy size={16} strokeWidth={2.5} /></div>
            <span className="auth-brand-text">Porra <span className="text-gold">Mundial</span></span>
          </Link>
          <div style={{ width: '90px' }} />
        </div>
      </div>

      <div className="auth-container">
        <div className="auth-card auth-card--wide">
          <div className="auth-card-header">
            <div className="auth-card-icon"><UserPlus size={26} /></div>
            <h1 className="auth-card-title">Crea tu cuenta</h1>
            <p className="auth-card-sub">
              Únete a la porra del Mundial 2026 en menos de un minuto.
            </p>
          </div>

          <form className="auth-form" onSubmit={handleSubmit} noValidate>
            {/* ------------- Sección 1: Información personal ------------- */}
            <div className="auth-section">
              <div className="auth-section-header">
                <div className="auth-section-num">1</div>
                <span className="auth-section-title">Información personal</span>
              </div>
              <p className="auth-section-sub">
                Tus datos para identificarte ante el resto de participantes.
              </p>

              <div className="auth-row">
                <div className="auth-field">
                  <label className="label" htmlFor="nombre">Nombre</label>
                  <div className="auth-field-with-icon">
                    <User size={16} className="auth-field-icon" />
                    <input
                      id="nombre"
                      className="input"
                      type="text"
                      placeholder="Tu nombre"
                      value={form.nombre}
                      onChange={updateField('nombre')}
                      autoComplete="given-name"
                    />
                  </div>
                </div>
                <div className="auth-field">
                  <label className="label" htmlFor="apellidos">Apellidos</label>
                  <div className="auth-field-with-icon">
                    <User size={16} className="auth-field-icon" />
                    <input
                      id="apellidos"
                      className="input"
                      type="text"
                      placeholder="Tus apellidos"
                      value={form.apellidos}
                      onChange={updateField('apellidos')}
                      autoComplete="family-name"
                    />
                  </div>
                </div>
              </div>

              <div className="auth-field">
                <label className="label" htmlFor="email">Email</label>
                <div className="auth-field-with-icon">
                  <Mail size={16} className="auth-field-icon" />
                  <input
                    id="email"
                    className="input"
                    type="email"
                    placeholder="tu@email.com"
                    value={form.email}
                    onChange={updateField('email')}
                    autoComplete="email"
                  />
                </div>
              </div>
            </div>

            {/* ------------- Sección 2: Credenciales de acceso ------------- */}
            <div className="auth-section">
              <div className="auth-section-header">
                <div className="auth-section-num">2</div>
                <span className="auth-section-title">Credenciales de acceso</span>
              </div>
              <p className="auth-section-sub">
                Estos serán tu usuario y contraseña para entrar a la porra.
              </p>

              <div className="auth-field">
                <label className="label" htmlFor="nickname">Nickname</label>
                <div className="auth-field-with-icon">
                  <AtSign size={16} className="auth-field-icon" />
                  <input
                    id="nickname"
                    className="input"
                    type="text"
                    placeholder="Tu apodo en la porra"
                    value={form.nickname}
                    onChange={updateField('nickname')}
                    autoComplete="username"
                  />
                </div>
              </div>

              <div className="auth-row">
                <div className="auth-field">
                  <label className="label" htmlFor="password">Contraseña</label>
                  <div className="auth-field-with-icon">
                    <Lock size={16} className="auth-field-icon" />
                    <input
                      id="password"
                      className="input"
                      type="password"
                      placeholder="Mínimo 6 caracteres"
                      value={form.password}
                      onChange={updateField('password')}
                      autoComplete="new-password"
                    />
                  </div>
                </div>
                <div className="auth-field">
                  <label className="label" htmlFor="passwordConfirm">Repetir contraseña</label>
                  <div className="auth-field-with-icon">
                    <Lock size={16} className="auth-field-icon" />
                    <input
                      id="passwordConfirm"
                      className="input"
                      type="password"
                      placeholder="Repítela"
                      value={form.passwordConfirm}
                      onChange={updateField('passwordConfirm')}
                      autoComplete="new-password"
                    />
                  </div>
                </div>
              </div>
            </div>

            {error && (
              <div className="auth-error">
                <AlertCircle size={18} />
                <span>{error}</span>
              </div>
            )}

            <div className="auth-actions">
              <button type="submit" className="btn btn-primary btn-lg" disabled={submitting}>
                {submitting ? 'Creando cuenta…' : 'Crear cuenta'}
              </button>
            </div>
          </form>

          <p className="auth-footer-text">
            ¿Ya tienes cuenta? <Link to="/login">Inicia sesión</Link>
          </p>
        </div>
      </div>

      {/* ------------- Modal de éxito ------------- */}
      {success && (
        <div className="auth-modal-backdrop" role="dialog" aria-modal="true">
          <div className="auth-modal">
            <div className="auth-modal-icon"><CheckCircle2 size={36} strokeWidth={2.2} /></div>
            <h2>¡Tu cuenta está lista!</h2>
            <p>
              Hemos creado tu perfil correctamente. Ya puedes iniciar sesión con
              <strong> {form.nickname}</strong> y tu contraseña.
            </p>
            <button
              type="button"
              className="btn btn-primary btn-lg"
              style={{ width: '100%' }}
              onClick={() => navigate('/')}
            >
              Aceptar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
