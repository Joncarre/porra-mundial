import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { createUser } from '../services/users.js';
import './auth.css';

const INITIAL = {
  nombre: '',
  apellidos: '',
  nickname: '',
  password: '',
  passwordConfirm: '',
};

export default function Register() {
  const navigate = useNavigate();
  const [form, setForm] = useState(INITIAL);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const updateField = (field) => (e) => {
    setForm((f) => ({ ...f, [field]: e.target.value }));
    if (errors[field]) setErrors((er) => ({ ...er, [field]: '' }));
  };

  const validateAll = () => {
    const e = {};
    if (!form.nombre.trim()) e.nombre = 'Introduce tu nombre.';
    if (!form.apellidos.trim()) e.apellidos = 'Introduce tus apellidos.';
    if (!form.nickname.trim()) e.nickname = 'Elige un nickname.';
    else if (form.nickname.trim().length < 3)
      e.nickname = 'Debe tener al menos 3 caracteres.';
    if (!form.password) e.password = 'Crea una contraseña.';
    else if (form.password.length < 6)
      e.password = 'Debe tener al menos 6 caracteres.';
    if (!form.passwordConfirm) e.passwordConfirm = 'Repite la contraseña.';
    else if (form.password !== form.passwordConfirm)
      e.passwordConfirm = 'Las contraseñas no coinciden.';
    return e;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = validateAll();
    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    setSubmitting(true);
    try {
      await createUser({
        nombre: form.nombre,
        apellidos: form.apellidos,
        nickname: form.nickname,
        password: form.password,
      });
      setSuccess(true);
    } catch (err) {
      // Errores del servidor que afectan a un campo concreto (nick duplicado)
      const msg = err.message || 'No se pudo completar el registro.';
      if (msg.toLowerCase().includes('nickname')) {
        setErrors({ nickname: msg });
      } else {
        setErrors({ _global: msg });
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="container auth-back-wrap auth-back-wrap--register">
        <Link to="/" className="auth-back">&larr; Volver al inicio</Link>
      </div>

      <div className="auth-container">
        <div className="auth-card auth-card--wide">
          <div className="auth-card-header">
            <span className="auth-card-eyebrow">Nueva cuenta</span>
            <h1 className="auth-card-title">Crea tu cuenta</h1>
            <p className="auth-card-sub">
              Únete a la porra del Mundial 2026 en menos de un minuto.
            </p>
          </div>

          <form className="auth-form" onSubmit={handleSubmit} noValidate>
            {/* ------------- Sección 1: Información personal ------------- */}
            <div className="auth-section">
              <div className="auth-section-header">
                <span className="auth-section-title">Información personal</span>
              </div>
              <p className="auth-section-sub auth-section-sub--no-indent">
                Tus datos para identificarte ante el resto de participantes.
              </p>

              <div className="auth-row">
                <div className="auth-field">
                  <label className="label" htmlFor="nombre">Nombre</label>
                  <input
                    id="nombre"
                    className={`input ${errors.nombre ? 'is-invalid' : ''}`}
                    type="text"
                    placeholder="Tu nombre"
                    value={form.nombre}
                    onChange={updateField('nombre')}
                    autoComplete="given-name"
                  />
                  {errors.nombre && <span className="field-error">{errors.nombre}</span>}
                </div>
                <div className="auth-field">
                  <label className="label" htmlFor="apellidos">Apellidos</label>
                  <input
                    id="apellidos"
                    className={`input ${errors.apellidos ? 'is-invalid' : ''}`}
                    type="text"
                    placeholder="Tus apellidos"
                    value={form.apellidos}
                    onChange={updateField('apellidos')}
                    autoComplete="family-name"
                  />
                  {errors.apellidos && <span className="field-error">{errors.apellidos}</span>}
                </div>
              </div>

            </div>

            {/* ------------- Sección 2: Credenciales ------------- */}
            <div className="auth-section">
              <div className="auth-section-header">
                <span className="auth-section-title">Credenciales de acceso</span>
              </div>
              <p className="auth-section-sub auth-section-sub--no-indent">
                Estos serán tu usuario y contraseña para entrar a la porra.
              </p>

              <div className="auth-field">
                <label className="label" htmlFor="nickname">Nickname</label>
                <input
                  id="nickname"
                  className={`input ${errors.nickname ? 'is-invalid' : ''}`}
                  type="text"
                  placeholder="Tu apodo en la porra"
                  value={form.nickname}
                  onChange={updateField('nickname')}
                  autoComplete="username"
                />
                {errors.nickname && <span className="field-error">{errors.nickname}</span>}
              </div>

              <div className="auth-row">
                <div className="auth-field">
                  <label className="label" htmlFor="password">Contraseña</label>
                  <input
                    id="password"
                    className={`input ${errors.password ? 'is-invalid' : ''}`}
                    type="password"
                    placeholder="Mínimo 6 caracteres"
                    value={form.password}
                    onChange={updateField('password')}
                    autoComplete="new-password"
                  />
                  {errors.password && <span className="field-error">{errors.password}</span>}
                </div>
                <div className="auth-field">
                  <label className="label" htmlFor="passwordConfirm">Repetir contraseña</label>
                  <input
                    id="passwordConfirm"
                    className={`input ${errors.passwordConfirm ? 'is-invalid' : ''}`}
                    type="password"
                    placeholder="Repítela"
                    value={form.passwordConfirm}
                    onChange={updateField('passwordConfirm')}
                    autoComplete="new-password"
                  />
                  {errors.passwordConfirm && (
                    <span className="field-error">{errors.passwordConfirm}</span>
                  )}
                </div>
              </div>
            </div>

            {errors._global && <div className="auth-error">{errors._global}</div>}

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
            <span className="auth-modal-eyebrow">¡Bienvenido!</span>
            <h2>Tu cuenta está lista</h2>
            <p>Hemos creado tu perfil correctamente.</p>

            <div className="auth-credentials">
              <div className="auth-credentials-row">
                <span className="auth-credentials-label">Nickname</span>
                <span className="auth-credentials-value">{form.nickname}</span>
              </div>
              <div className="auth-credentials-divider" />
              <div className="auth-credentials-row">
                <span className="auth-credentials-label">Contraseña</span>
                <span className="auth-credentials-value">{form.password}</span>
              </div>
            </div>

            <div className="auth-warning">
              <span className="auth-warning-label">Importante</span>
              <p className="auth-warning-text">
                Apunta estas credenciales antes de continuar. Una vez cierres
                esta ventana no podrás volver a verlas.
              </p>
            </div>

            <button
              type="button"
              className="btn btn-primary btn-lg"
              style={{ width: '100%' }}
              onClick={() => navigate('/')}
            >
              Las he apuntado, continuar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
