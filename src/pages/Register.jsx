import { useState } from 'react';
import { Link, useNavigate, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { CheckCircle } from 'lucide-react';

export default function Register() {
  const { user, register, loading } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    nombre: '', apellidos: '', email: '', nickname: '', password: '', passwordRepeat: '',
  });
  const [fieldErrors, setFieldErrors] = useState({});
  const [generalError, setGeneralError] = useState('');
  const [success, setSuccess] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  if (loading) return <div className="spinner-wrap"><div className="spinner" /></div>;
  if (user) return <Navigate to="/clasificacion" replace />;

  const validateField = (name, value, currentForm) => {
    const f = currentForm || form;
    switch (name) {
      case 'nombre':    return value.trim() ? '' : 'El nombre es obligatorio';
      case 'apellidos': return value.trim() ? '' : 'Los apellidos son obligatorios';
      case 'email':
        if (!value.trim()) return 'El email es obligatorio';
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return 'El email no es válido';
        return '';
      case 'nickname':
        if (!value.trim()) return 'El nickname es obligatorio';
        if (value.trim().length < 3) return 'Mínimo 3 caracteres';
        return '';
      case 'password':
        if (!value) return 'La contraseña es obligatoria';
        if (value.length < 4) return 'Mínimo 4 caracteres';
        return '';
      case 'passwordRepeat':
        if (!value) return 'Repite la contraseña';
        if (value !== f.password) return 'Las contraseñas no coinciden';
        return '';
      default: return '';
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    const updated = { ...form, [name]: value };
    setForm(updated);
    if (fieldErrors[name] !== undefined) {
      setFieldErrors((prev) => ({ ...prev, [name]: validateField(name, value, updated) }));
    }
    setGeneralError('');
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    setFieldErrors((prev) => ({ ...prev, [name]: validateField(name, value) }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errors = {};
    Object.keys(form).forEach((name) => {
      errors[name] = validateField(name, form[name]);
    });
    setFieldErrors(errors);
    if (Object.values(errors).some(Boolean)) return;

    setSubmitting(true);
    try {
      await register({
        nombre: form.nombre,
        apellidos: form.apellidos,
        email: form.email,
        nickname: form.nickname,
        password: form.password,
      });
      setSuccess(true);
    } catch (err) {
      setGeneralError(err.message || 'Error al crear la cuenta');
    } finally {
      setSubmitting(false);
    }
  };

  const fieldErr = (name) =>
    fieldErrors[name] ? <p className="field-error">{fieldErrors[name]}</p> : null;

  if (success) {
    return (
      <div className="auth-page-light">
        <div className="pub-blob pub-blob-1" />
        <div className="pub-blob pub-blob-2" />
        <div className="auth-card-light">
          <div className="register-success-wrap">
            <div className="register-success-icon">
              <CheckCircle size={32} color="#059669" />
            </div>
            <h2 className="register-success-title">¡Cuenta creada!</h2>
            <p className="register-success-sub">
              Ya puedes iniciar sesión. Guarda tus credenciales de acceso:
            </p>
            <div className="credentials-box">
              <div className="credentials-box-label">Tus datos de acceso</div>
              <div className="credential-row">
                <span className="credential-key">Nickname</span>
                <span className="credential-val">{form.nickname}</span>
              </div>
              <div className="credential-row">
                <span className="credential-key">Contraseña</span>
                <span className="credential-val">{form.password}</span>
              </div>
            </div>
            <button className="btn-pub-primary" onClick={() => navigate('/login')}>
              Aceptar
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-page-light">
      <div className="pub-blob pub-blob-1" />
      <div className="pub-blob pub-blob-2" />

      <div className="auth-card-light wide">
        <div style={{ textAlign: 'center', marginBottom: '1.75rem' }}>
          <div className="auth-logo-light">⚽</div>
          <h2 className="auth-title-light">Crear cuenta</h2>
          <p className="auth-sub-light">Únete a la porra del Mundial 2026</p>
        </div>

        {generalError && <div className="alert-error-light">{generalError}</div>}

        <form onSubmit={handleSubmit} noValidate>
          <span className="section-label-light">Información personal</span>

          <div className="pub-two-col">
            <div className="form-group-light">
              <label className="form-label-light">Nombre</label>
              <input
                className={`form-input-light${fieldErrors.nombre ? ' has-error' : ''}`}
                type="text"
                name="nombre"
                value={form.nombre}
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder="Tu nombre"
                autoFocus
              />
              {fieldErr('nombre')}
            </div>
            <div className="form-group-light">
              <label className="form-label-light">Apellidos</label>
              <input
                className={`form-input-light${fieldErrors.apellidos ? ' has-error' : ''}`}
                type="text"
                name="apellidos"
                value={form.apellidos}
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder="Tus apellidos"
              />
              {fieldErr('apellidos')}
            </div>
          </div>

          <div className="form-group-light">
            <label className="form-label-light">Email</label>
            <input
              className={`form-input-light${fieldErrors.email ? ' has-error' : ''}`}
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              onBlur={handleBlur}
              placeholder="tu@email.com"
            />
            {fieldErr('email')}
          </div>

          <hr className="section-divider-light" />
          <span className="section-label-light">Datos de acceso</span>

          <div className="form-group-light">
            <label className="form-label-light">Nickname</label>
            <input
              className={`form-input-light${fieldErrors.nickname ? ' has-error' : ''}`}
              type="text"
              name="nickname"
              value={form.nickname}
              onChange={handleChange}
              onBlur={handleBlur}
              placeholder="Ej: Tigre2026"
              autoComplete="username"
            />
            {fieldErr('nickname') || <p className="form-hint-light">Nombre visible en la clasificación</p>}
          </div>

          <div className="pub-two-col">
            <div className="form-group-light">
              <label className="form-label-light">Contraseña</label>
              <input
                className={`form-input-light${fieldErrors.password ? ' has-error' : ''}`}
                type="password"
                name="password"
                value={form.password}
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder="Mínimo 4 caracteres"
                autoComplete="new-password"
              />
              {fieldErr('password')}
            </div>
            <div className="form-group-light">
              <label className="form-label-light">Repetir contraseña</label>
              <input
                className={`form-input-light${fieldErrors.passwordRepeat ? ' has-error' : ''}`}
                type="password"
                name="passwordRepeat"
                value={form.passwordRepeat}
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder="Repite la contraseña"
                autoComplete="new-password"
              />
              {fieldErr('passwordRepeat')}
            </div>
          </div>

          <button
            type="submit"
            className="btn-pub-primary"
            disabled={submitting}
            style={{ marginTop: '1rem' }}
          >
            {submitting ? 'Creando cuenta...' : 'Crear cuenta'}
          </button>
        </form>

        <div className="auth-footer-light">
          ¿Ya tienes cuenta? <Link to="/login">Inicia sesión</Link>
        </div>
      </div>
    </div>
  );
}
