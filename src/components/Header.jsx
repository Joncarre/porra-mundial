import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Trophy, Grid3X3, GitMerge, Shield, LogOut, User } from 'lucide-react';

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
    <header style={{
      position: 'sticky', top: 0, zIndex: 100,
      background: 'rgba(255, 251, 248, 0.94)',
      backdropFilter: 'blur(20px)',
      WebkitBackdropFilter: 'blur(20px)',
      borderBottom: '1px solid rgba(204, 197, 185, 0.5)',
      boxShadow: '0 1px 12px rgba(64, 61, 57, 0.06)',
      height: 64, display: 'flex', alignItems: 'center',
    }}>
      <div className="container">
        <div className="header-content">

          <Link
            to={user ? '/clasificacion' : '/'}
            style={{ display: 'flex', alignItems: 'baseline', gap: '0.375rem', textDecoration: 'none', flexShrink: 0 }}
          >
            <span style={{
              fontFamily: "'Playfair Display', Georgia, serif",
              fontSize: '1.125rem', fontWeight: 700,
              color: '#2d3142', letterSpacing: '-0.01em',
            }}>
              Porra
            </span>
            <span style={{
              fontFamily: "'Cormorant Garamond', Georgia, serif",
              fontSize: '1.25rem', fontWeight: 600, fontStyle: 'italic',
              color: '#ef8354', letterSpacing: '0.01em',
            }}>
              Mundial 2026
            </span>
          </Link>

          {user && (
            <nav className="header-nav">
              {navItems.map(({ to, label, icon: Icon }) => {
                const isActive = location.pathname === to;
                return (
                  <Link
                    key={to}
                    to={to}
                    style={{
                      display: 'flex', alignItems: 'center', gap: '0.35rem',
                      padding: '0.4rem 0.875rem', borderRadius: '8px',
                      fontSize: '0.875rem',
                      fontWeight: isActive ? 600 : 400,
                      color: isActive ? '#ef8354' : '#4f5d75',
                      background: isActive ? 'rgba(239, 131, 84, 0.07)' : 'transparent',
                      border: isActive ? '1px solid rgba(239, 131, 84, 0.18)' : '1px solid transparent',
                      textDecoration: 'none', transition: '0.2s ease',
                    }}
                  >
                    <Icon size={14} strokeWidth={isActive ? 2 : 1.5} />
                    <span>{label}</span>
                  </Link>
                );
              })}
            </nav>
          )}

          {user && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.875rem', marginLeft: 'auto' }}>
              <span style={{
                fontFamily: "'Cormorant Garamond', Georgia, serif",
                fontSize: '1.0625rem', fontWeight: 600, fontStyle: 'italic',
                color: '#ef8354',
              }}>
                @{user.nickname}
              </span>
              <button
                onClick={handleLogout}
                title="Cerrar sesión"
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  width: 34, height: 34, background: 'transparent',
                  border: '1px solid rgba(204, 197, 185, 0.7)',
                  borderRadius: '8px', color: '#4f5d75', cursor: 'pointer',
                  transition: '0.2s ease',
                }}
              >
                <LogOut size={14} strokeWidth={1.5} />
              </button>
            </div>
          )}

        </div>
      </div>
    </header>
  );
}
