import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Trophy, LogIn, AtSign, Lock, AlertCircle, ArrowLeft } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import './auth.css';

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const [form, setForm] = useState({ nickname: '', password: '' });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const updateField = (field) => (e) => {
    setForm((f) => ({ ...f, [field]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!form.nickname.trim() || !form.password) {
      setError('Introduce tu nickname y contraseña.');
      return;
    }
    setSubmitting(true);
    try {
      await login(form.nickname.trim(), form.password);
      const dest = location.state?.from || '/perfil';
      navigate(dest, { replace: true });
    } catch (err) {
      setError(err.message || 'No se pudo iniciar sesión.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="auth-page">
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
        <div className="auth-card">
          <div className="auth-card-header">
            <div className="auth-card-icon"><LogIn size={26} /></div>
            <h1 className="auth-card-title">Inicia sesión</h1>
            <p className="auth-card-sub">Vuelve a tu porra y consulta tus pronósticos.</p>
          </div>

          <form className="auth-form" onSubmit={handleSubmit} noValidate>
            <div className="auth-field">
              <label className="label" htmlFor="nickname">Nickname</label>
              <div className="auth-field-with-icon">
                <AtSign size={16} className="auth-field-icon" />
                <input
                  id="nickname"
                  className="input"
                  type="text"
                  placeholder="Tu nickname"
                  value={form.nickname}
                  onChange={updateField('nickname')}
                  autoComplete="username"
                  autoFocus
                />
              </div>
            </div>

            <div className="auth-field">
              <label className="label" htmlFor="password">Contraseña</label>
              <div className="auth-field-with-icon">
                <Lock size={16} className="auth-field-icon" />
                <input
                  id="password"
                  className="input"
                  type="password"
                  placeholder="Tu contraseña"
                  value={form.password}
                  onChange={updateField('password')}
                  autoComplete="current-password"
                />
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
