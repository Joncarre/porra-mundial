import { useState } from 'react';
import { Link, useNavigate, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { UserPlus, CheckCircle } from 'lucide-react';

export default function Register() {
  const { user, register, loading } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    nombre: '',
    apellidos: '',
    email: '',
    nickname: '',
    password: '',
    passwordRepeat: '',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  if (loading) return <div className="spinner-wrap"><div className="spinner" /></div>;
  if (user) return <Navigate to="/clasificacion" replace />;

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setError('');
  };

  const validate = () => {
    if (!form.nombre.trim()) return 'El nombre es obligatorio.';
    if (!form.apellidos.trim()) return 'Los apellidos son obligatorios.';
    if (!form.email.trim()) return 'El email es obligatorio.';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) return 'El email no es válido.';
    if (!form.nickname.trim()) return 'El nickname es obligatorio.';
    if (form.nickname.trim().length < 3) return 'El nickname debe tener al menos 3 caracteres.';
    if (!form.password) return 'La contraseña es obligatoria.';
    if (form.password.length < 4) return 'La contraseña debe tener al menos 4 caracteres.';
    if (form.password !== form.passwordRepeat) return 'Las contraseñas no coinciden.';
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }
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
      setError(err.message || 'Error al crear la cuenta.');
    } finally {
      setSubmitting(false);
    }
  };

  if (success) {
    return (
      <div className="auth-page">
        <div className="auth-card" style={{ textAlign: 'center' }}>
          <CheckCircle size={48} color="var(--green)" style={{ margin: '0 auto 1rem' }} />
          <h2 style={{ marginBottom: '0.75rem' }}>¡Cuenta creada!</h2>
          <p style={{ color: 'var(--text-2)', marginBottom: '2rem', lineHeight: 1.6 }}>
            Tu cuenta ha sido creada correctamente. Ya puedes iniciar sesión con tu
            nickname y contraseña.
          </p>
          <button
            className="btn btn-primary btn-full btn-lg"
            onClick={() => navigate('/')}
          >
            Aceptar e iniciar sesión
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-page">
      <div className="auth-card" style={{ maxWidth: 520 }}>
        <div className="auth-header">
          <div className="auth-logo">⚽</div>
          <h2>Crear cuenta</h2>
          <p>Únete a la porra del Mundial 2026</p>
        </div>

        <form onSubmit={handleSubmit}>
          {error && (
            <div className="alert alert-error" style={{ marginBottom: '1.25rem' }}>
              {error}
            </div>
          )}

          {/* Información personal */}
          <p className="section-label">Información personal</p>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 1rem' }}>
            <div className="form-group">
              <label className="form-label">Nombre</label>
              <input
                className="form-input"
                type="text"
                name="nombre"
                value={form.nombre}
                onChange={handleChange}
                placeholder="Tu nombre"
                autoFocus
              />
            </div>
            <div className="form-group">
              <label className="form-label">Apellidos</label>
              <input
                className="form-input"
                type="text"
                name="apellidos"
                value={form.apellidos}
                onChange={handleChange}
                placeholder="Tus apellidos"
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Email</label>
            <input
              className="form-input"
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              placeholder="tu@email.com"
            />
          </div>

          <hr className="section-divider" />

          {/* Acceso */}
          <p className="section-label">Datos de acceso</p>

          <div className="form-group">
            <label className="form-label">Nickname</label>
            <input
              className="form-input"
              type="text"
              name="nickname"
              value={form.nickname}
              onChange={handleChange}
              placeholder="Ej: Tigre2026"
              autoComplete="username"
            />
            <p className="form-hint">Este será tu nombre visible en la clasificación.</p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 1rem' }}>
            <div className="form-group">
              <label className="form-label">Contraseña</label>
              <input
                className="form-input"
                type="password"
                name="password"
                value={form.password}
                onChange={handleChange}
                placeholder="Mínimo 4 caracteres"
                autoComplete="new-password"
              />
            </div>
            <div className="form-group">
              <label className="form-label">Repetir contraseña</label>
              <input
                className="form-input"
                type="password"
                name="passwordRepeat"
                value={form.passwordRepeat}
                onChange={handleChange}
                placeholder="Repite la contraseña"
                autoComplete="new-password"
              />
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-primary btn-full btn-lg"
            disabled={submitting}
            style={{ marginTop: '0.5rem' }}
          >
            {submitting ? (
              <>
                <span style={{ width: 16, height: 16, border: '2px solid rgba(0,0,0,0.3)', borderTopColor: '#000', borderRadius: '50%', display: 'inline-block', animation: 'spin 0.7s linear infinite' }} />
                Creando cuenta...
              </>
            ) : (
              <>
                <UserPlus size={16} />
                Crear cuenta
              </>
            )}
          </button>
        </form>

        <div className="auth-footer">
          ¿Ya tienes cuenta? <Link to="/login">Inicia sesión</Link>
        </div>
      </div>
    </div>
  );
}
