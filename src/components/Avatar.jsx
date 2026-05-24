import './Avatar.css';

const SIZES = { xs: 28, sm: 40, md: 56, lg: 96, xl: 140 };

// Paleta pastel para el fallback con inicial: elegida de forma estable
// según el primer carácter del nombre para que cada usuario tenga su color.
const PALETTE = [
  { bg: '#f4e4c1', fg: '#a37c34' },
  { bg: '#f8d8b0', fg: '#b8753a' },
  { bg: '#d6e2ee', fg: '#4d6f9c' },
  { bg: '#d4dfc8', fg: '#5d7d4f' },
  { bg: '#f5d2c8', fg: '#a64a3f' },
  { bg: '#dcd2e8', fg: '#6f50a0' },
  { bg: '#c9dde0', fg: '#3e7e8e' },
  { bg: '#f1d2d6', fg: '#a64a60' },
];

function pickPalette(name) {
  const key = (name || '?').trim().toLowerCase();
  if (!key) return PALETTE[0];
  return PALETTE[key.charCodeAt(0) % PALETTE.length];
}

/**
 * Avatar del usuario.
 * - Si hay `foto` (data URL o URL), la muestra recortada en círculo.
 * - Si no, muestra la inicial del nombre/nick sobre un círculo pastel.
 *
 * Props:
 *  - foto: data URL o URL de la foto subida (opcional)
 *  - name: nombre o nickname para la inicial fallback
 *  - size: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | número (px)
 *  - selected: añade halo dorado
 *  - onClick: si se pasa, el avatar se renderiza como botón
 *  - title: tooltip
 */
export default function Avatar({ foto, name, size = 'md', selected = false, onClick, title }) {
  const dimension = typeof size === 'number' ? size : SIZES[size];
  const Component = onClick ? 'button' : 'div';
  const cls = [
    'avatar',
    selected ? 'avatar--selected' : '',
    onClick ? 'avatar--clickable' : '',
    foto ? 'avatar--photo' : 'avatar--initial',
  ].filter(Boolean).join(' ');

  if (foto) {
    return (
      <Component
        type={onClick ? 'button' : undefined}
        onClick={onClick}
        title={title || name || ''}
        className={cls}
        style={{ width: dimension, height: dimension }}
      >
        <img src={foto} alt="" draggable={false} />
      </Component>
    );
  }

  const initial = (name || '?').trim().charAt(0).toUpperCase() || '?';
  const { bg, fg } = pickPalette(name);

  return (
    <Component
      type={onClick ? 'button' : undefined}
      onClick={onClick}
      title={title || name || ''}
      className={cls}
      style={{
        width: dimension,
        height: dimension,
        background: bg,
        color: fg,
        fontSize: Math.round(dimension * 0.42),
      }}
    >
      {initial}
    </Component>
  );
}
