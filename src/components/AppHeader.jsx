import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useState, useRef, useEffect } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import Avatar from './Avatar.jsx';
import './AppHeader.css';

/**
 * Cabecera para las páginas autenticadas.
 * Solo enlaza pantallas existentes — las nuevas se irán añadiendo en cada
 * fase de desarrollo.
 */
export default function AppHeader() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    const onDocClick = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', onDocClick);
    return () => document.removeEventListener('mousedown', onDocClick);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <header className="app-header">
      <div className="container app-header-inner">
        <Link to="/perfil" className="app-brand">
          Porra <span className="text-gold">Mundial</span>
        </Link>

        <nav className="app-nav">
          <NavLink
            to="/perfil"
            className={({ isActive }) => `app-nav-link ${isActive ? 'is-active' : ''}`}
          >
            Perfil
          </NavLink>
          <NavLink
            to="/grupos"
            className={({ isActive }) => `app-nav-link ${isActive ? 'is-active' : ''}`}
          >
            Grupos
          </NavLink>
          <NavLink
            to="/apuestas"
            className={({ isActive }) => `app-nav-link ${isActive ? 'is-active' : ''}`}
          >
            Apuestas
          </NavLink>
          {user?.isAdmin && (
            <NavLink
              to="/admin"
              className={({ isActive }) => `app-nav-link app-nav-link--admin ${isActive ? 'is-active' : ''}`}
            >
              Admin
            </NavLink>
          )}
        </nav>

        <div className="app-user-menu" ref={menuRef}>
          <button
            type="button"
            className="app-user-trigger"
            onClick={() => setMenuOpen((v) => !v)}
          >
            <Avatar id={user?.avatarId} size={44} />
            <div className="app-user-info">
              <span className="app-user-nick">@{user?.nickname}</span>
              {user?.isAdmin && <span className="app-user-role">Admin</span>}
            </div>
          </button>

          {menuOpen && (
            <div className="app-user-dropdown">
              <Link
                to="/perfil"
                className="app-user-dropdown-item"
                onClick={() => setMenuOpen(false)}
              >
                Mi perfil
              </Link>
              <button
                className="app-user-dropdown-item app-user-dropdown-item--danger"
                onClick={handleLogout}
              >
                Cerrar sesión
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
