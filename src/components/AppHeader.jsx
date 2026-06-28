import { Link, NavLink, useNavigate, useLocation } from 'react-router-dom';
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
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [navOpen, setNavOpen] = useState(false);
  const menuRef = useRef(null);
  const navRef = useRef(null);
  const navToggleRef = useRef(null);

  useEffect(() => {
    const onDocClick = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
      if (
        navRef.current &&
        !navRef.current.contains(e.target) &&
        navToggleRef.current &&
        !navToggleRef.current.contains(e.target)
      ) {
        setNavOpen(false);
      }
    };
    document.addEventListener('mousedown', onDocClick);
    return () => document.removeEventListener('mousedown', onDocClick);
  }, []);

  // Cierra ambos menús al cambiar de ruta.
  useEffect(() => {
    setNavOpen(false);
    setMenuOpen(false);
  }, [location.pathname]);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  // Enlaces de navegación según el rol, definidos una sola vez y
  // reutilizados tanto en la barra de escritorio como en el menú móvil.
  const links = [
    { to: '/perfil', label: 'Perfil' },
    { to: '/grupos', label: 'R. Grupos' },
    { to: '/resultados-bracket', label: 'R. Bracket' },
    ...(!user?.isAdmin
      ? [
          { to: '/apuestas', label: 'Apuestas' },
          { to: '/bracket', label: 'Bracket' },
          { to: '/extras', label: 'Extras' },
        ]
      : []),
    { to: '/clasificacion', label: 'Clasificación' },
    ...(user?.isAdmin ? [{ to: '/admin', label: 'Admin', admin: true }] : []),
  ];

  return (
    <header className="app-header">
      <div className="container">
        <div className="app-header-bar">
          <span className="app-brand">
            Porra <span className="text-gold">Mundial</span>
          </span>

          <nav className="app-nav">
            {links.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                className={({ isActive }) =>
                  `app-nav-link ${link.admin ? 'app-nav-link--admin' : ''} ${isActive ? 'is-active' : ''}`
                }
              >
                {link.label}
              </NavLink>
            ))}
          </nav>

          <div className="app-header-actions">
            <div className="app-user-menu" ref={menuRef}>
              <button
                type="button"
                className="app-user-trigger"
                onClick={() => setMenuOpen((v) => !v)}
              >
                <Avatar foto={user?.avatarFoto} name={user?.nombre || user?.nickname} size={42} />
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

            <button
              type="button"
              ref={navToggleRef}
              className={`app-nav-toggle ${navOpen ? 'is-open' : ''}`}
              aria-label="Abrir menú de navegación"
              aria-expanded={navOpen}
              onClick={() => setNavOpen((v) => !v)}
            >
              <span className="app-nav-toggle-bar" />
              <span className="app-nav-toggle-bar" />
              <span className="app-nav-toggle-bar" />
            </button>
          </div>
        </div>

        {navOpen && (
          <div className="app-mobile-nav" ref={navRef}>
            <nav className="app-mobile-nav-inner">
              {links.map((link) => (
                <NavLink
                  key={link.to}
                  to={link.to}
                  className={({ isActive }) =>
                    `app-mobile-nav-link ${link.admin ? 'app-mobile-nav-link--admin' : ''} ${isActive ? 'is-active' : ''}`
                  }
                  onClick={() => setNavOpen(false)}
                >
                  {link.label}
                </NavLink>
              ))}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}
