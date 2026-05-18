import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Trophy, Users, Grid3X3, GitMerge, Shield, LogOut, User } from 'lucide-react';

export default function Header() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const navItems = [
    { to: '/perfil', label: 'Mi Perfil', icon: User },
    { to: '/clasificacion', label: 'Clasificación', icon: Trophy },
    { to: '/grupos', label: 'Grupos', icon: Grid3X3 },
    { to: '/eliminatoria', label: 'Eliminatoria', icon: GitMerge },
    ...(user?.isAdmin ? [{ to: '/admin', label: 'Admin', icon: Shield }] : []),
  ];

  return (
    <header className="header">
      <div className="container">
        <div className="header-content">
          <Link to={user ? '/clasificacion' : '/'} className="header-logo">
            <span className="logo-icon">⚽</span>
            <span>Porra <span className="logo-accent">Mundial 2026</span></span>
          </Link>

          {user && (
            <nav className="header-nav">
              {navItems.map(({ to, label, icon: Icon }) => (
                <Link
                  key={to}
                  to={to}
                  className={`nav-link ${location.pathname === to ? 'active' : ''}`}
                >
                  <Icon size={15} />
                  <span>{label}</span>
                </Link>
              ))}
            </nav>
          )}

          {user && (
            <div className="header-user">
              <span className="user-nick">{user.nickname}</span>
              <button onClick={handleLogout} className="btn-logout" title="Cerrar sesión">
                <LogOut size={15} />
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
