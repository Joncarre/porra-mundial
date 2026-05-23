import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import './auth.css';

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const [form, setForm] = useState({ nickname: '', password: '' });
  const [errors, setErrors] = useState({});
  const [globalError, setGlobalError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const updateField = (field) => (e) => {
    setForm((f) => ({ ...f, [field]: e.target.value }));
    if (errors[field]) setErrors((er) => ({ ...er, [field]: '' }));
    if (globalError) setGlobalError('');
  };

  const validate = () => {
    const e = {};
    if (!form.nickname.trim()) e.nickname = 'Introduce tu nickname.';
    if (!form.password) e.password = 'Introduce tu contraseña.';
    return e;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = validate();
    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    setSubmitting(true);
    try {
      await login(form.nickname.trim(), form.password);
      const dest = location.state?.from || '/perfil';
      navigate(dest, { replace: true });
    } catch (err) {
      setGlobalError(err.message || 'No se pudo iniciar sesión.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="container auth-back-wrap">
        <Link to="/" className="auth-back">&larr; Volver al inicio</Link>
      </div>

      <div className="auth-container">
        <div className="auth-card">
          <div className="auth-card-header">
            <span className="auth-card-eyebrow">Acceso</span>
            <h1 className="auth-card-title">Inicia sesión</h1>
            <p className="auth-card-sub">Vuelve a tu porra y consulta tus pronósticos.</p>
          </div>

          <form className="auth-form" onSubmit={handleSubmit} noValidate>
            <div className="auth-field">
              <label className="label" htmlFor="nickname">Nickname</label>
              <input
                id="nickname"
                className={`input ${errors.nickname ? 'is-invalid' : ''}`}
                type="text"
                placeholder="Tu nickname"
                value={form.nickname}
                onChange={updateField('nickname')}
                autoComplete="username"
                autoFocus
              />
              {errors.nickname && <span className="field-error">{errors.nickname}</span>}
            </div>

            <div className="auth-field">
              <label className="label" htmlFor="password">Contraseña</label>
              <input
                id="password"
                className={`input ${errors.password ? 'is-invalid' : ''}`}
                type="password"
                placeholder="Tu contraseña"
                value={form.password}
                onChange={updateField('password')}
                autoComplete="current-password"
              />
              {errors.password && <span className="field-error">{errors.password}</span>}
            </div>

            {globalError && <div className="auth-error">{globalError}</div>}

            <div className="auth-actions">
              <button type="submit" className="btn btn-primary btn-lg" disabled={submitting}>
                {submitting ? 'Entrando…' : 'Iniciar sesión'}
              </button>
            </div>
          </form>

          <p className="auth-footer-text">
            ¿No tienes cuenta? <Link to="/register">Regístrate</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
