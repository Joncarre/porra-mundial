import {
  Crown,
  Trophy,
  Diamond,
  Shield,
  Flame,
  Star,
  Zap,
  Sparkles,
  Moon,
  Award,
  Rocket,
  Leaf,
} from 'lucide-react';
import { buscarAvatar } from '../data/avatars.js';
import './Avatar.css';

const ICONS = {
  Crown,
  Trophy,
  Diamond,
  Shield,
  Flame,
  Star,
  Zap,
  Sparkles,
  Moon,
  Award,
  Rocket,
  Leaf,
};

const SIZES = {
  xs: 28,
  sm: 40,
  md: 56,
  lg: 96,
  xl: 140,
};

const ICON_RATIO = 0.5;

/**
 * Avatar premium predefinido.
 *
 * Props:
 *  - id: identificador del avatar (ver data/avatars.js)
 *  - size: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | número en px
 *  - selected: añade halo dorado para indicar selección
 *  - onClick: si se pasa, el avatar se comporta como botón
 *  - title: tooltip opcional
 */
export default function Avatar({ id, size = 'md', selected = false, onClick, title }) {
  const avatar = buscarAvatar(id);
  const Icon = ICONS[avatar.icon] || Crown;

  const dimension = typeof size === 'number' ? size : SIZES[size];
  const iconSize = Math.round(dimension * ICON_RATIO);

  const Component = onClick ? 'button' : 'div';

  return (
    <Component
      type={onClick ? 'button' : undefined}
      onClick={onClick}
      title={title || avatar.name}
      className={`avatar avatar--${typeof size === 'string' ? size : 'custom'} ${selected ? 'avatar--selected' : ''} ${onClick ? 'avatar--clickable' : ''}`}
      style={{
        width: dimension,
        height: dimension,
        backgroundImage: `${avatar.pattern}, ${avatar.gradient}`,
      }}
    >
      <Icon size={iconSize} strokeWidth={1.8} style={{ color: avatar.accent }} />
    </Component>
  );
}
