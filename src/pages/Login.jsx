import { useState } from 'react';
import { Link, useNavigate, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const { user, login, loading } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ nickname: '', password: '' });
  const [fieldErrors, setFieldErrors] = useState({});
  const [generalError, setGeneralError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (loading) return <div className="spinner-wrap"><div className="spinner" /></div>;
  if (user) return <Navigate to="/clasificacion" replace />;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (fieldErrors[name]) {
      setFieldErrors((prev) => ({ ...prev, [name]: value ? '' : prev[name] }));
    }
    setGeneralError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errors = {
      nickname: form.nickname ? '' : 'El nickname es obligatorio',
      password: form.password ? '' : 'La contraseña es obligatoria',
    };
    setFieldErrors(errors);
    if (errors.nickname || errors.password) return;

    setSubmitting(true);
    try {
      await login(form.nickname, form.password);
      navigate('/clasificacion');
    } catch (err) {
      setGeneralError(err.message || 'Nickname o contraseña incorrectos');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="auth-page-light">
      <div className="pub-blob pub-blob-1" />
      <div className="pub-blob pub-blob-2" />

      <div className="auth-card-light">
        <div style={{ textAlign: 'center', marginBottom: '1.75rem' }}>
          <div className="auth-logo-light">⚽</div>
          <h2 className="auth-title-light">Bienvenido de vuelta</h2>
          <p className="auth-sub-light">Inicia sesión para acceder a tu porra</p>
        </div>

        {generalError && <div className="alert-error-light">{generalError}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group-light">
            <label className="form-label-light">Nickname</label>
            <input
              className={`form-input-light${fieldErrors.nickname ? ' has-error' : ''}`}
              type="text"
              name="nickname"
              value={form.nickname}
              onChange={handleChange}
              placeholder="Tu nickname"
              autoComplete="username"
              autoFocus
            />
            {fieldErrors.nickname && <p className="field-error">{fieldErrors.nickname}</p>}
          </div>

          <div className="form-group-light" style={{ marginBottom: '1.75rem' }}>
            <label className="form-label-light">Contraseña</label>
            <input
              className={`form-input-light${fieldErrors.password ? ' has-error' : ''}`}
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              placeholder="Tu contraseña"
              autoComplete="current-password"
            />
            {fieldErrors.password && <p className="field-error">{fieldErrors.password}</p>}
          </div>

          <button
            type="submit"
            className="btn-pub-primary"
            disabled={submitting}
          >
            {submitting ? 'Entrando...' : 'Iniciar Sesión'}
          </button>
        </form>

        <div className="auth-footer-light">
          ¿No tienes cuenta? <Link to="/register">Regístrate aquí</Link>
        </div>
      </div>
    </div>
  );
}
